import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useUser } from "../../hooks/useUser";
import { Loading } from "../../components/loading/loading";
import { Page, sidenavItems } from "../../components/page/page";
import { useAuth } from "../../hooks/useAuth";
import { Util, Typography, DropdownInput } from "tabler-react-2";
import { Avatar } from "tabler-react-2/dist/avatar";
import { LogTimeline } from "../../components/logs/timeline";
import { Table } from "tabler-react-2/dist/table";
import moment from "moment";
import { Button } from "tabler-react-2/dist/button";
import { Icon } from "../../util/Icon";
import Badge from "tabler-react-2/dist/badge";
import { useModal } from "tabler-react-2/dist/modal";
import { useShops } from "../../hooks/useShops";
import { Spinner } from "tabler-react-2/dist/spinner";
import { Alert } from "tabler-react-2/dist/alert";
const { H1, H2, H3 } = Typography;

const AddUserToShopForm = ({ user, onFinish }) => {
  const [selectedShop, setSelectedShop] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const { shops, loading, addUserToShop, opLoading, error } = useShops();
  const [ok, setOk] = useState(null);

  if (loading)
    return (
      <>
        <p>Loading Shops...</p>
        <br />
        <Spinner />
      </>
    );

  if (ok)
    return <Alert variant="success">User added to shop successfully</Alert>;

  return (
    <div>
      {error && (
        <Alert variant="danger" title="Error">
          {error}
        </Alert>
      )}
      <H3>Select a shop to add {user.firstName} to:</H3>
      <Util.Row gap={1} wrap>
        <DropdownInput
          prompt="Select a shop"
          values={shops.map((shop) => ({
            id: shop.id,
            label: shop.name,
          }))}
          value={selectedShop}
          onChange={(value) => setSelectedShop(value)}
        />
        <DropdownInput
          prompt="Select a role"
          values={[
            { id: "CUSTOMER", label: "Customer" },
            { id: "OPERATOR", label: "Operator" },
            { id: "ADMIN", label: "Admin" },
            { id: "INSTRUCTOR", label: "Instructor" },
          ]}
          value={selectedRole}
          onChange={setSelectedRole}
        />
      </Util.Row>
      {selectedRole && selectedShop && (
        <>
          <Util.Hr />
          <p>
            You are about to add {user.firstName} to {selectedShop.label} as{" "}
            {selectedRole.label}
          </p>
          <Button
            onClick={async () => {
              const ok = await addUserToShop(
                user.id,
                selectedShop.id,
                selectedRole.id
              );
              if (ok) setOk(true);
              onFinish();
            }}
            variant="primary"
            loading={opLoading}
          >
            Confirm
          </Button>
        </>
      )}
    </div>
  );
};

const AddUserToShop = ({ user, shops, loading, onFinish }) => {
  const { modal, ModalElement } = useModal({
    title: "Add User to Shop",
  });

  return (
    <div>
      {ModalElement}
      <Button
        onClick={() =>
          modal({
            text: (
              <AddUserToShopForm
                user={user}
                shops={shops}
                onFinish={onFinish}
              />
            ),
          })
        }
      >
        <Icon i="circle-plus" size={18} /> Add {user.firstName} to a new shop
      </Button>
    </div>
  );
};

export const UserPage = () => {
  const { userId } = useParams();
  const {
    user,
    loading,
    refetch,
    opLoading: userOpLoading,
    SuspendConfirmModal,
    UnSuspendConfirmModal,
    suspendUser,
    unSuspendUser,
    updateSuspensionReason,
    promoteUserToGlobalAdmin,
    demoteUserFromGlobalAdmin,
  } = useUser(userId);
  const { user: activeUser } = useAuth();
  const {
    shops,
    loading: shopsLoading,
    removeUserFromShop,
    opLoading,
    changeUserRole,
  } = useShops();

  if (loading) return <Loading />;

  return (
    <Page sidenavItems={sidenavItems("Users", activeUser?.admin)}>
      {SuspendConfirmModal}
      {UnSuspendConfirmModal}
      <Util.Row gap={2}>
        <Avatar size="xl" dicebear initials={user.id} />
        <Util.Col>
          <H1>
            {user.firstName} {user.lastName}
          </H1>
          <p>{user.email}</p>
          <Util.Row gap={0.5}>
            {user.isMe && (
              <Badge color="green" soft>
                <Icon i="user" size={12} />
                This is your profile
              </Badge>
            )}
            {user.admin && (
              <Badge color="green" soft>
                <Icon i="lego" size={12} />
                Global Admin
              </Badge>
            )}
            {user.suspended && (
              <Badge color="red" soft>
                <Icon i="ban" size={12} />
                Suspended
              </Badge>
            )}
          </Util.Row>
        </Util.Col>
        <Util.Col
          style={{
            flex: 1,
            alignItems: "flex-end",
          }}
          gap={1}
        >
          {activeUser.admin && (
            <>
              <Button
                onClick={async () => {
                  await refetch(true);
                }}
              >
                <Icon i="reload" size={18} /> Refetch User
              </Button>
              {!user.isMe &&
                (user.admin ? (
                  <Button
                    variant="danger"
                    outline
                    size="sm"
                    onClick={demoteUserFromGlobalAdmin}
                  >
                    <Icon i="user-down" size={12} /> Demote from global admin
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    outline
                    size="sm"
                    onClick={promoteUserToGlobalAdmin}
                  >
                    <Icon i="user-up" size={12} /> Promote to global admin
                  </Button>
                ))}
              {!user.isMe &&
                (user.suspended ? (
                  <Util.Row gap={0.5}>
                    <Button
                      variant="danger"
                      ghost
                      size="sm"
                      onClick={unSuspendUser}
                    >
                      <Icon i="pencil" size={12} /> Modify suspension reason
                    </Button>{" "}
                    <Button
                      variant="danger"
                      outline
                      size="sm"
                      onClick={unSuspendUser}
                    >
                      <Icon i="circle-dashed-check" size={12} /> Unsuspend user
                    </Button>
                  </Util.Row>
                ) : (
                  <Button
                    variant="danger"
                    outline
                    size="sm"
                    onClick={suspendUser}
                  >
                    <Icon i="ban" size={12} /> Suspend user
                  </Button>
                ))}
            </>
          )}
        </Util.Col>
      </Util.Row>
      {user.suspended && (
        <>
          <Util.Hr />
          <Alert
            variant="danger"
            title="This user is suspended"
            icon={<Icon i="ban" size={32} />}
          >
            This user is suspended. Reason: <i>{user.suspensionReason}</i>
            {activeUser.admin && (
              <>
                <Util.Spacer size={1} />
                <Button onClick={updateSuspensionReason}>
                  <Icon i="pencil" size={18} />
                  Update Suspension Reason
                </Button>{" "}
                <Button onClick={unSuspendUser} variant="danger" outline>
                  <Icon i="circle-dashed-check" size={18} />
                  Unsuspend User
                </Button>
              </>
            )}
          </Alert>
        </>
      )}
      <Util.Hr />
      <Util.Row
        gap={2}
        style={{
          alignItems: "flex-start",
        }}
      >
        <div style={{ width: "50%" }}>
          <H2>Shops</H2>
          {activeUser.admin && (
            <AddUserToShop
              user={user}
              shops={shops}
              loading={shopsLoading}
              onFinish={() => refetch(false)}
            />
          )}
          <Util.Spacer size={1} />
          <Table
            columns={[
              {
                label: "Shop",
                accessor: "shop.name",
                render: (name, context) => (
                  <a href={`/shops/${context.shop.id}`}>{name}</a>
                ),
              },
              {
                label: "Role",
                accessor: "accountType",
                render: (accountType, context) =>
                  activeUser.admin ? (
                    opLoading ? (
                      <Spinner />
                    ) : (
                      <DropdownInput
                        value={{
                          id: accountType,
                        }}
                        values={[
                          { id: "CUSTOMER", label: "Customer" },
                          { id: "OPERATOR", label: "Operator" },
                          { id: "ADMIN", label: "Admin" },
                          { id: "INSTRUCTOR", label: "Instructor" },
                        ]}
                        onChange={async (value) => {
                          await changeUserRole(
                            user.id,
                            context.shop.id,
                            value.id
                          );
                          refetch(false);
                        }}
                      />
                    )
                  ) : (
                    accountType
                  ),
              },
              {
                label: "Date Joined",
                accessor: "createdAt",
                render: (createdAt) => moment(createdAt).format("MM/DD/YY"),
              },
              {
                label: "Disconnect",
                accessor: "id",
                render: (id, context) => (
                  <Button
                    data-context={JSON.stringify(context)}
                    variant="danger"
                    outline
                    onClick={async () => {
                      await removeUserFromShop(user.id, context.shop.id);
                      refetch(false);
                    }}
                    loading={opLoading}
                  >
                    <Icon i="plug-connected-x" size={18} />
                  </Button>
                ),
              },
            ]}
            data={user.shops}
          />
        </div>
        <div style={{ width: "50%" }}>
          <H2>Logs</H2>
          <LogTimeline logs={user.logs} />
        </div>
      </Util.Row>
    </Page>
  );
};