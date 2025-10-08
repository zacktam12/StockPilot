import React from "react";
import NewUserDrawer from "../drawers/NewUserDrawer";

const UsersActions = ({ 
  isNewUserModalOpen,
  onCloseNewUserModal,
  onNewUserSuccess,
  editingUser
}) => {
  return (
    <>

      {/* New User Drawer */}
      <NewUserDrawer
        user={editingUser}
        isOpen={isNewUserModalOpen}
        onClose={onCloseNewUserModal}
        onSuccess={onNewUserSuccess}
      />

    </>
  );
};

export default UsersActions;
