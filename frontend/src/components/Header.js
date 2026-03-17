import React from "react";

function Header() {
  return (

    <div className="bg-white shadow p-4 flex justify-between items-center">

      <h2 className="text-lg font-semibold text-primary">
        AI Student Dashboard
      </h2>

      <div className="flex items-center gap-4">

        <span className="text-gray-600">
          Admin
        </span>

        <img
          src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          alt="profile"
          className="w-8"
        />

      </div>

    </div>

  );
}

export default Header;