import React, { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Edit, Trash, Eye, Download, Copy } from "lucide-react";
import Button from "./Button";

const ActionMenu = ({
  actions = [],
  item,
  className = "",
  triggerClassName = "",
  menuClassName = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAction = (action) => {
    if (action.onClick) {
      action.onClick(item);
    }
    setIsOpen(false);
  };

  const defaultActions = [
    {
      label: "View",
      icon: <Eye size={16} />,
      onClick: () => {},
      variant: "ghost",
    },
    {
      label: "Edit",
      icon: <Edit size={16} />,
      onClick: () => {},
      variant: "ghost",
    },
    {
      label: "Delete",
      icon: <Trash size={16} />,
      onClick: () => {},
      variant: "ghost",
      className: "text-red-600 hover:text-red-700 hover:bg-red-50",
    },
  ];

  const menuActions = actions.length > 0 ? actions : defaultActions;

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <Button
        variant="ghost"
        size="sm"
        icon={<MoreHorizontal size={16} />}
        onClick={() => setIsOpen(!isOpen)}
        className={triggerClassName}
      />

      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50 ${menuClassName}`}
        >
          {menuActions.map((action, index) => (
            <button
              key={index}
              className={`w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-200 ${
                action.className || ""
              }`}
              onClick={() => handleAction(action)}
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActionMenu;
