import { LedgerItemType, LogType } from "@prisma/client";
import { prisma } from "../../../../../util/prisma.js";
import { verifyAuth } from "../../../../../util/verifyAuth.js";
import { generateInvoice } from "../../../../../util/docgen/invoice.js";

/** @type {Prisma.JobInclude} */
const JOB_INCLUDE = {
  items: {
    where: {
      active: true,
    },
    include: {
      resource: {
        select: {
          costingPublic: true,
          costPerProcessingTime: true,
          costPerTime: true,
          costPerUnit: true,
          title: true,
        },
      },
      material: {
        select: {
          costPerUnit: true,
          unitDescriptor: true,
          title: true,
        },
      },
    },
  },
  resource: {
    select: {
      id: true,
      title: true,
    },
  },
  additionalCosts: {
    where: {
      active: true,
    },
    include: {
      resource: {
        select: {
          costPerProcessingTime: true,
          costPerTime: true,
          costPerUnit: true,
        },
      },
      material: {
        select: {
          costPerUnit: true,
        },
      },
    },
  },
  ledgerItems: {
    where: {
      type: LedgerItemType.JOB,
    },
  },
};

export const get = [
  verifyAuth,
  async (req, res) => {
    try {
      const { shopId, jobId } = req.params;
      const userId = req.user.id;

      const userShop = await prisma.userShop.findFirst({
        where: {
          userId,
          shopId,
          active: true,
        },
      });

      if (!userShop) {
        return res
          .status(400)
          .json({ error: "You are not a member of this shop" });
      }

      const shouldLoadAll =
        req.user.admin ||
        userShop.accountType === "ADMIN" ||
        userShop.accountType === "OPERATOR";

      const job = await prisma.job.findFirst({
        where: {
          id: jobId,
          shopId,
          userId: shouldLoadAll ? undefined : userId,
        },
        include: JOB_INCLUDE,
      });

      // TODO: Respect costing public

      if (!job) {
        return res.status(404).json({ error: "Not found" });
      }

      return res.json({ job });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "An error occurred" });
    }
  },
];

export const put = [
  verifyAuth,
  async (req, res) => {
    try {
      const { shopId, jobId } = req.params;
      const userId = req.user.id;

      const userShop = await prisma.userShop.findFirst({
        where: {
          userId,
          shopId,
          active: true,
        },
      });

      if (!userShop) {
        return res.status(400).json({ error: "Forbidden" });
      }

      let job;

      const shouldLoadAll =
        req.user.admin ||
        userShop.accountType === "ADMIN" ||
        userShop.accountType === "OPERATOR";

      job = await prisma.job.findFirst({
        where: {
          id: jobId,
          userId: shouldLoadAll ? undefined : userId,
        },
        include: {
          additionalCosts: {
            include: {
              material: true,
              resource: true,
            },
          },
          items: {
            include: {
              material: true,
              resource: true,
            },
          },
        },
      });

      if (!job) {
        return res.status(404).json({ error: "Not found" });
      }

      delete req.body.id;
      delete req.body.userId;
      delete req.body.shopId;
      delete req.body.createdAt;
      delete req.body.updatedAt;
      delete req.body.items;
      delete req.body.resource;

      let updatedJob;
      if (req.body.finalized && !job.finalized) {
        if (
          !(
            userShop.accountType === "ADMIN" ||
            userShop.accountType === "OPERATOR" ||
            req.user.admin
          )
        ) {
          return res.status(400).json({ error: "Forbidden" });
        }

        const { url, key, value, log } = await generateInvoice(
          job,
          userId,
          shopId
        );
        await prisma.job.update({
          where: {
            id: jobId,
          },
          data: {
            finalized: true,
            finalizedAt: new Date(),
          },
        });

        const ledgerItem = await prisma.ledgerItem.create({
          data: {
            shopId,
            jobId,
            userId: job.userId,
            invoiceUrl: url,
            invoiceKey: key,
            value: value * -1,
            type: LedgerItemType.JOB,
          },
        });

        await prisma.logs.update({
          where: {
            id: log.id,
          },
          data: {
            ledgerItemId: ledgerItem.id,
          },
        });

        await prisma.logs.createMany({
          data: [
            {
              userId: req.user.id,
              shopId,
              jobId,
              type: LogType.JOB_FINALIZED,
              ledgerItemId: ledgerItem.id,
            },
            {
              userId: req.user.id,
              shopId,
              jobId,
              type: LogType.LEDGER_ITEM_CREATED,
              ledgerItemId: ledgerItem.id,
            },
          ],
        });

        // Finalize job
      } else {
        updatedJob = await prisma.job.update({
          where: {
            id: jobId,
          },
          data: req.body,
          include: JOB_INCLUDE,
        });

        await prisma.logs.create({
          data: {
            type: LogType.JOB_MODIFIED,
            userId,
            shopId,
            jobId,
            from: JSON.stringify(job),
            to: JSON.stringify(updatedJob),
          },
        });
      }

      return res.json({ job: updatedJob });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "An error occurred" });
    }
  },
];
