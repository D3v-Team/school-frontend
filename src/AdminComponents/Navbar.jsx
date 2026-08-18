import React, { useState } from "react";

import {
  Navbar,
  Typography,
  Button,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
  IconButton,
} from "@material-tailwind/react";
import {
  UserCircleIcon,
  ChevronDownIcon,
  PowerIcon,
  Bars2Icon,
} from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";
import { User2Icon } from "lucide-react";

export function ProfileMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const userInfo = JSON.parse(localStorage.getItem("auth-user")) || {};

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <section className="flex items-center gap-3">
      <div>
        <h3>+998{userInfo?.phone || "99#######"}</h3>
      </div>

      <Menu open={isMenuOpen} handler={setIsMenuOpen} placement="bottom-end">
        <MenuHandler>
          <Button
            variant="text"
            color="blue-gray"
            className="flex items-center gap-1 rounded-full py-0.5 pr-2 pl-0.5 lg:ml-auto"
          >
            <Avatar
              variant="circular"
              size="sm"
              alt="user avatar"
              className="border border-gray-900 p-0.5"
              src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1480&q=80"
            />
            <ChevronDownIcon
              strokeWidth={2.5}
              className={`h-3 w-3 transition-transform ${isMenuOpen ? "rotate-180" : ""
                }`}
            />
          </Button>
        </MenuHandler>

        <MenuList className="p-1">
          <MenuItem className="flex items-center gap-2 rounded">
            <User2Icon className="h-4 w-4" strokeWidth={2} />
            <Typography as="span" variant="small" className="font-normal">
              {userInfo?.name}
            </Typography>
          </MenuItem>


          <Link to="profile">

            <MenuItem className="flex items-center gap-2 rounded">
              <UserCircleIcon className="h-4 w-4" strokeWidth={2} />
              <Typography as="span" variant="small" className="font-normal">
                Mening Profilim
              </Typography>
            </MenuItem>
          </Link>

          <MenuItem
            onClick={handleLogout}
            className="flex items-center gap-2 rounded hover:bg-red-500/10 focus:bg-red-500/10 active:bg-red-500/10"
          >
            <PowerIcon className="h-4 w-4 text-red-500" strokeWidth={2} />
            <Typography
              as="span"
              variant="small"
              className="font-normal"
              color="red"
            >
              Chiqish
            </Typography>
          </MenuItem>
        </MenuList>
      </Menu>
    </section>
  );
}

export function ComplexNavbar() {
  const [isNavOpen, setIsNavOpen] = React.useState(false);

  const toggleIsNavOpen = () => setIsNavOpen((cur) => !cur);

  React.useEffect(() => {
    window.addEventListener(
      "resize",
      () => window.innerWidth >= 960 && setIsNavOpen(false)
    );
  }, []);

  return (
    <Navbar className="mx-auto max-w-screen-xl p-2 lg:rounded-full lg:pl-6">
      <div className="relative mx-auto flex items-center justify-between text-blue-gray-900">
        <Typography
          as="a"
          href="#"
          className="mr-4 ml-2 cursor-pointer py-1.5 font-medium"
        >
          Admin
        </Typography>
        <IconButton
          size="sm"
          color="blue-gray"
          variant="text"
          onClick={toggleIsNavOpen}
          className="ml-auto mr-2 lg:hidden"
        >
          <Bars2Icon className="h-6 w-6" />
        </IconButton>
        <div className="flex items-center gap-[10px]">
          <ProfileMenu />
        </div>
      </div>
    </Navbar>
  );
}
