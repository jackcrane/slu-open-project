import { prisma } from "#prisma";
import { verifyAuth } from "#verifyAuth";
import { LogType } from "@prisma/client";

export const get = [
  verifyAuth,
  async (req, res) => {
    const { shopId, userId } = req.params;

    const userShop = await prisma.userShop.findFirst({
      where: {
        userId,
        shopId,
        active: true,
      },
    });

    if (
      !(
        req.user.admin ||
        userShop.accountType === "ADMIN" ||
        userShop.accountType === "OPERATOR" ||
        req.user.id === userId
      )
    ) {
      return res.status(400).json({ error: "Unauthorized" });
    }

    const ledgerItems = await prisma.ledgerItem.findMany({
      where: {
        shopId,
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        job: {
          select: {
            title: true,
          },
        },
      },
    });

    const balance = ledgerItems.reduce((acc, item) => acc + item.value, 0);

    res.json({ ledgerItems, balance });
  },
];

export const post = [
  verifyAuth,
  async (req, res) => {
    const { shopId, userId } = req.params;
    const { type, value } = req.body;

    const userShop = await prisma.userShop.findFirst({
      where: {
        userId,
        shopId,
        active: true,
      },
    });

    if (
      !(
        req.user.admin ||
        userShop.accountType === "ADMIN" ||
        userShop.accountType === "OPERATOR"
      )
    ) {
      return res.status(400).json({ error: "Unauthorized" });
    }

    const existingLedgerItems = await prisma.ledgerItem.findMany({
      where: {
        shopId,
        userId,
      },
      select: {
        value: true,
      },
    });

    const balance = existingLedgerItems.reduce(
      (acc, item) => acc + item.value,
      0
    );

    // Value can be MANUAL_TOPUP, MANUAL_DEPOSIT, FUNDS_PURCHASED, and MANUAL_REDUCTION
    let valueToPost = 0;
    switch (type) {
      case "MANUAL_TOPUP":
        if (balance > value) {
          return res
            .status(400)
            .json({ error: "Balance is greater than topup" });
        }
        valueToPost = parseFloat(value) - balance;
        break;
      case "MANUAL_DEPOSIT":
        valueToPost = parseFloat(value);
        break;
      case "FUNDS_PURCHASED":
        valueToPost = parseFloat(value);
        break;
      case "MANUAL_REDUCTION":
        valueToPost = parseFloat(value) * -1;
        break;
      default:
        console.error("Invalid type", type);
        return res.status(400).json({ error: "Invalid type" });
    }

    const ledgerItem = await prisma.ledgerItem.create({
      data: {
        shopId,
        userId,
        type,
        value: valueToPost,
      },
    });

    await prisma.logs.create({
      data: {
        type: LogType.LEDGER_ITEM_CREATED_MANUALLY,
        userId,
        ledgerItemId: ledgerItem.id,
        shopId: shopId,
        to: JSON.stringify({
          postedBy: req.user.id,
        }),
      },
    });

    const ledgerItems = await prisma.ledgerItem.findMany({
      where: {
        shopId,
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        job: {
          select: {
            title: true,
          },
        },
      },
    });

    const balanceAfter = ledgerItems.reduce((acc, item) => acc + item.value, 0);

    res.json({ ledgerItems, balance: balanceAfter });
  },
];