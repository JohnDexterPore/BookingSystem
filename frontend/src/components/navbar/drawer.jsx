import React from "react";
import {
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemPrefix,
  Drawer,
  Card,
} from "@material-tailwind/react";
import {
  BookmarkIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  InboxIcon,
  PowerIcon,
} from "@heroicons/react/24/solid";
import {
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
function SidebarWithBurgerMenu() {
  const [open, setOpen] = React.useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  const handleOpen = (value) => {
    setOpen(open === value ? 0 : value);
  };

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  return (
    <>
      <IconButton variant="text" size="lg" onClick={openDrawer}>
        {isDrawerOpen ? (
          <XMarkIcon className="h-8 w-8 stroke-1" />
        ) : (
          <Bars3Icon className="h-8 w-8 stroke-1" />
        )}
      </IconButton>
      <Drawer open={isDrawerOpen} onClose={closeDrawer} placement="right">
        <Card
          color="transparent"
          shadow={false}
          className="h-[calc(100vh-2rem)] w-full p-4"
        >
          <div className="mb-2 flex items-center gap-4 p-4">
            <img
              className="size-12"
              src="./src/assets/img/frontlogo.png"
              alt="Bonchon Logo"
            />
            <Typography variant="h5" color="blue-gray">
              Boooking
            </Typography>
          </div>
          <List>
            <hr className="my-2 border-blue-gray-50" />
            <ListItem>
              <ListItemPrefix>
                <InboxIcon className="h-5 w-5" />
              </ListItemPrefix>
              Inbox
            </ListItem>
            <ListItem>
              <ListItemPrefix>
                <UserCircleIcon className="h-5 w-5" />
              </ListItemPrefix>
              Profile
            </ListItem>
            <ListItem>
              <ListItemPrefix>
                <Cog6ToothIcon className="h-5 w-5" />
              </ListItemPrefix>
              Settings
            </ListItem>
            <ListItem>
              <ListItemPrefix>
                <PowerIcon className="h-5 w-5" />
              </ListItemPrefix>
              Log Out
            </ListItem>
          </List>
        </Card>
      </Drawer>
    </>
  );
}

export default SidebarWithBurgerMenu;
