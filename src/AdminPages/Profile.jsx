import React, { useState, useEffect } from "react";
import { $api } from "../utils";
import CustomDataTable from "../lib/custom-data-table";
import Loader from "../lib/loader";
import { DeleteAdmin } from "../AdminComponents/profile/delete-admin";
import { UpdateAdmin } from "../AdminComponents/profile/update-admin";
import { AddAdmin } from "../AdminComponents/profile/add-admin";

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const fetchData = async () => {
    try {
      const response = await $api.get("/user");
      setData(response.data.data);
    } catch (error) {
      console.error("Xatolik yuz berdi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      name: "ID",
      selector: (_, index) => (page - 1) * perPage + index + 1,
      sortable: true,
    },
    {
      name: "Ism",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "Telefon",
      selector: (row) => row.phone,
      sortable: true,
    },
    {
      name: "Login",
      selector: (row) => row.login,
      sortable: true,
    },
    {
      name: "Yaratilgan sana",
      selector: (row) => row.created_at,
      sortable: true,
    },
    {
      name: "Action",
      cell: (row) => (
        <div className="flex space-x-2">
          <UpdateAdmin onUpdated={fetchData} rowData={row} />
          <DeleteAdmin onDeleted={fetchData} rowId={row.id} />
        </div>
      ),
      width: "120px",
    },
  ];

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <div className=" flex  justify-between items-center my-4">
        <h2 className="text-xl font-bold mb-4">Foydalanuvchi Profili</h2>
        <div>
          <AddAdmin onAdminAdded={fetchData} />
        </div>
      </div>
      <CustomDataTable
        data={data}
        columns={columns}
        page={page}
        setPage={setPage}
        perPage={perPage}
        setPerPage={setPerPage}
      />
    </div>
  );
}
