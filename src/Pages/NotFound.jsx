import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center bg-black text-white font-sans">
      <h1 className="text-6xl mb-4">404</h1>
      <p className="text-2xl mb-6">Sahifa topilmadi</p>
      <div className=" flex gap-4 items-center">
        <Link to="/">
          <a className="px-6 py-3 bg-blue-500 cursor-pointer text-white font-semibold rounded-lg shadow-lg hover:bg-blue-600 transition">
            Bosh sahifaga qaytish
          </a>
        </Link>
        <a onClick={() => history.back()} className="px-6 py-3 bg-white hover:bg-gray-300 cursor-pointer rounded-lg shadow-lg font-semibold text-black transition">
          Ortga qaytish
        </a>
      </div>
    </div>
  );
}
