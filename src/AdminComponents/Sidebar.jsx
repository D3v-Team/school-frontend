import React, { useState } from "react";
import { IoLogoReact } from "react-icons/io5";
import { FaChartPie } from "react-icons/fa6";
import { TiMessages } from "react-icons/ti";
import { MdPermMedia } from "react-icons/md";
import { MdFindInPage } from "react-icons/md";
import { IoPeopleSharp } from "react-icons/io5";
import Logo from '../img/Logowhite.png'

import {
  FaBuilding,
  FaHandshake,
  FaHome,
  FaChevronDown,
  FaChevronRight,
} from "react-icons/fa";
import { BsFillPostcardFill } from "react-icons/bs";

import {
  TbCategory,
  TbNews,
  TbClipboardList,
  TbWorld,
} from "react-icons/tb";
import {
  MdRequestPage,
  MdBusiness,
} from "react-icons/md";
import { AiOutlineInteraction, AiOutlineFileText } from "react-icons/ai";
import { RiTeamFill } from "react-icons/ri";
import { Link, useLocation } from "react-router-dom";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { RiLogoutBoxLine } from "react-icons/ri";
import { GrSchedule } from "react-icons/gr";

const menuItems = [
  { name: "Asosiy", path: "/admin", icon: <FaHome className="text-lg" /> },
  {
    name: "Murojaatlar",
    path: "/admin/message-user",
    icon: <TiMessages className="text-lg" />,
  },
  {
    name: "Menular", // Kategoriya
    path: "/admin/categories",
    icon: <TbCategory className="text-lg" />,
  },
  {
    name: "Yangiliklar",
    subItems: [
      { name: "Barcha yangiliklar", path: "/admin/news" },
      { name: "Yangilik yaratish", path: "/admin/news/create" },
    ],
    path: "/admin/news",
    icon: <TbNews className="text-lg" />,
  },
  {
    name: "Statik Sahifalar",
    subItems: [
      { name: "Xalqaro aloqalar", path: "/admin/international" }, 
      { name: "Biz haqimizda", path: "/admin/aboutus" },
      { name: "Hamkorlarimiz", path: "/admin/OurPartners" },
      {
        name: "Bolimlar",
        path: "/admin/sections",
      },
      { name: "Markazlar", path: "/admin/centers" },

      {
        name: "Rekvizitlar",
        path: "/admin/recvizits",
      },
      {
        name: "Interakriv Hizmatlar",
        path: "/admin/Interactives/Services",
      },
    ],
    path: "/admin/events",
    icon: <MdFindInPage className="text-lg" />,
  },
  {
    name: "Dinamik Sahifalar",
    subItems: [
      { name: "Barcha sahifalar", path: "/admin/post" },
    ],
    path: "/admin/events",
    icon: <MdFindInPage className="text-lg" />,
  },
  {
    name: "Rahbariyat",
    subItems: [
   { name: "Foto medialar", path: "/admin/photo-media" },
      { name: "Video medialar", path: "/admin/video-media" },

      { name: "Rahbariyat", path: "/admin/management", },
      {
        name: "Bo'sh ish o'rinlari",
        path: "/admin/vacancies",
      },
      {
        name: "Statistika",
        path: "/admin/statistics",
      },
      {
        name: "Marosimlar Jadvali",
        path: "/admin/schedule-event",
      },


    ],
    path: "/admin/events",
    icon: <IoPeopleSharp className="text-lg" />,
  },
  {
    name: "Ochiq ma'lumotlar",
    subItems: [
      { name: "Ochiq Malumotlar", path: "/admin/open-data" },

      { name: "Korrupsiyaga qarshi", path: "/admin/against-corrution" },
      { name: "Me'yoriy hujjatlar", path: "/admin/regulatory-doc" },
      {
        name: "Murojaatlarni ko‘rib chiqish tartibi",
        path: "/admin/review",
      },

    ],
    path: "/admin/events",
    icon: <AiOutlineFileText className="text-lg" />,
  },
];

export default function Sidebar({ isCollapsed, setIsCollapsed, handleLogOut }) {
  const location = useLocation();
  const [openAccordion, setOpenAccordion] = useState(null);

  const toggleAccordion = (index) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };


  return (
    <div
      className={`h-screen bg-lb text-white transition-all duration-300 overflow-y-auto ${isCollapsed ? "w-20" : "w-64"
        } p-4 shadow-lg flex flex-col justify-between fixed z-50 `}
    >
      <div>
        <img className="w-[100px] mx-auto mb-[20px]" src={Logo} alt="Foto" />
        <div
          className={`text-xl font-semibold text-center flex items-center justify-center mb-8 ${isCollapsed ? "" : "hidden"
            }`}
        >
        </div>
        <ul className="space-y-2">
          {menuItems.map((item, index) =>
            item.subItems ? (
              <li key={index}>
                <button
                  onClick={() => toggleAccordion(index)}
                  className="flex items-center justify-between w-full p-2 hover:bg-blue-700 rounded-md"
                >
                  <div className="flex items-center gap-4">
                    {item.icon}
                    {!isCollapsed && (
                      <span className="text-sm min-w-5">{item.name}</span>
                    )}
                  </div>
                  {!isCollapsed && (
                    <FaChevronDown
                      className={`text-sm transition-transform ${openAccordion === index ? "rotate-180" : ""
                        }`}
                    />
                  )}
                </button>
                {openAccordion === index && (
                  <ul className="pl-6 mt-2 space-y-1">
                    {item.subItems.map((subItem, subIndex) => (
                      <Link
                        key={subIndex}
                        to={subItem.path}
                        className={`flex items-center gap-2 p-2 text-sm rounded-md hover:bg-blue-700 ${location.pathname === subItem.path
                          ? "!bg-blue-600"
                          : ""
                          }`}
                      >
                        <FaChevronRight />
                        {subItem.name}
                      </Link>
                    ))}
                  </ul>
                )}
              </li>
            ) : (
              <Link
                key={index}
                to={item.path}
                className={`flex items-center gap-4 p-2 rounded-md hover:bg-blue-700 ${location.pathname === item.path ? "bg-blue-600" : ""
                  }`}
              >
                {item.icon}
                {!isCollapsed && <span className="text-sm">{item.name}</span>}
              </Link>
            )
          )}
          <li
            onClick={handleLogOut}
            className="flex items-center hover:bg-blue-700 gap-4 p-2 cursor-pointer rounded-md"
          >
            <RiLogoutBoxLine className="text-xl" />
            {!isCollapsed && <span className="text-sm">Chiqish</span>}
          </li>
        </ul>
      </div>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center justify-center p-2 mt-6 bg-blue-500 hover:bg-blue-700 rounded-md focus:outline-none"
      >
        {isCollapsed ? (
          <MdChevronRight className="text-2xl" />
        ) : (
          <MdChevronLeft className="text-2xl" />
        )}
      </button>
    </div>
  );
}
