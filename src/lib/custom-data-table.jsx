import React from "react";
import DataTable, { defaultThemes } from "react-data-table-component";

const ExpandedComponent = ({ data }) => {
	return <pre>{JSON.stringify(data, null, 2)}</pre>;
};

export default function CustomDataTable({
  data,
  columns,
  page,
  setPage,
  perPage,
  setPerPage,
}) {
  // Custom styles for header
  const customStyles = {
    header: {
      style: {
        minHeight: '46px',
      },
    },
    headRow: {
      style: {
        borderTopStyle: 'solid',
        borderTopWidth: '1px',
        borderTopColor: defaultThemes.default.divider.default,
      },
    },
    headCells: {
      style: {
        '&:not(:last-of-type)': {
          borderRightStyle: 'solid',
          borderRightWidth: '1px',
          borderRightColor: defaultThemes.default.divider.default,
        },
      },
    },
    cells: {
      style: {
        '&:not(:last-of-type)': {
          borderRightStyle: 'solid',
          borderRightWidth: '1px',
          padding: '8px',
          borderRightColor: defaultThemes.default.divider.default,
          whiteSpace: 'normal',  // Matn sig‘masa, yangi qatordan chiqadi
          wordBreak: 'break-word', // Uzoq so‘zlar qatorga sig‘masa, bo‘linadi
          overflowWrap: 'break-word', // So‘zlar ustun chegarasiga sig‘masa, bo‘linadi
          // whitespace-pre-wrap
        },
        whiteSpace: 'normal',  // Matn sig‘masa, yangi qatordan chiqadi
        wordBreak: 'break-word', // Uzoq so‘zlar qatorga sig‘masa, bo‘linadi
        overflowWrap: 'break-word', // So‘zlar ustun chegarasiga sig‘masa, bo‘linadi
        
      },
    },
  };
  

  const handlePageChange = (page) => {
    setPage(page);
  };

  const handlePerPageChange = (newPerPage) => {
    setPerPage(newPerPage);
    setPage(1); // Per page o'zgarganda 1-betga qaytish
  };

  return (
    <div>
      <DataTable
        theme="solorized"
        columns={columns}
        data={data}
        fixedHeader
        pagination
        paginationPerPage={perPage}
        paginationRowsPerPageOptions={[10, 15, 20]} // Per page opsiyalari
        paginationTotalRows={data?.length > 0 ? data?.length : 1} // Pagination uchun umumiy satrlar
        onChangePage={handlePageChange} // Page o'zgarishini ushlash
        onChangeRowsPerPage={handlePerPageChange} // Per page o'zgarishini ushlash
        highlightOnHover // Hover qilinganda satrni belgilash
        customStyles={customStyles} // Maxsus stylelar


        // expandableRows expandableRowsComponent={ExpandedComponent}
      />
    </div>
  );
}
