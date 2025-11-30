// ** React Imports
import { Fragment, useState, useEffect } from "react";

// ** Invoice List Sidebar
import Sidebar from "./Sidebar";

// ** Table Columns
import { getColumns } from "./columns";

// ** Store & Actions
import { getAllData, getData } from "../store";
import { useDispatch, useSelector } from "react-redux";

// ** Third Party Components
import Select from "react-select";
import ReactPaginate from "react-paginate";
import DataTable from "react-data-table-component";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  ChevronDown,
  Share,
  Printer,
  FileText,
  File,
  Grid,
  Copy,
} from "react-feather";

// ** Utils
import { selectThemeColors } from "@utils";

// ** Reactstrap Imports
import {
  Row,
  Col,
  Card,
  Input,
  Label,
  Button,
  CardBody,
  CardTitle,
  CardHeader,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
  UncontrolledDropdown,
} from "reactstrap";

// ** Styles
import "@styles/react/libs/react-select/_react-select.scss";
import "@styles/react/libs/tables/react-dataTable-component.scss";
import { useParams } from "react-router-dom";

// ** Table Header
const CustomHeader = ({
  store,
  toggleSidebar,
  handlePerPage,
  rowsPerPage,
  handleFilter,
  searchTerm,
}) => {
  // ** Converts table to CSV

  const { tabtype } = useParams();
  // Get user data
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");

  function convertArrayOfObjectsToCSV(array) {
    let result;

    const columnDelimiter = ",";
    const lineDelimiter = "\n";
    const keys = Object.keys(store.data[0]);

    result = "";
    result += keys.join(columnDelimiter);
    result += lineDelimiter;

    array.forEach((item) => {
      let ctr = 0;
      keys.forEach((key) => {
        if (ctr > 0) result += columnDelimiter;

        result += item[key];

        ctr++;
      });
      result += lineDelimiter;
    });

    return result;
  }

  // ** Downloads CSV
  // ✅ Convert to CSV
  const handlePrint = () => {
    const dataTable = document.querySelector(".rdt_TableBody");

    if (!dataTable) {
      alert("No table found to print!");
      return;
    }

    // ✅ Get headers and remove duplicates
    let headers = Array.from(document.querySelectorAll(".rdt_TableCol div"))
      .map((th) => th.textContent.trim())
      .filter(Boolean);

    // ✅ Remove consecutive duplicates (like S.No repeating twice)
    headers = headers.filter((text, i) => text && text !== headers[i - 1]);

    // ✅ Get table rows and cell values
    const rows = Array.from(dataTable.querySelectorAll(".rdt_TableRow")).map(
      (row) =>
        Array.from(row.querySelectorAll(".rdt_TableCell")).map((cell) =>
          cell.textContent.trim()
        )
    );

    // ✅ Build table HTML
    const tableHTML = `
    <table>
      <thead>
        <tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (r) => `<tr>${r.map((c) => `<td>${c || ""}</td>`).join("")}</tr>`
          )
          .join("")}
      </tbody>
    </table>
  `;

    const printWindow = window.open("", "_blank");
    const currentDate = new Date().toLocaleString();

    printWindow.document.write(`
    <html>
      <head>
        <title>Task Table</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            padding: 30px;
            color: #333;
          }
          h2 {
            text-align: center;
            margin-bottom: 8px;
          }
          .timestamp {
            text-align: center;
            font-size: 12px;
            color: #666;
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
          }
          thead tr {
            background-color: #f0f0f0;
          }
          th, td {
            border: 1px solid #ccc;
            padding: 8px 10px;
            text-align: left;
            vertical-align: top;
            max-width: 200px;
            word-wrap: break-word;
          }
          th {
            background: #e8e8e8;
            font-weight: bold;
            text-transform: capitalize;
          }
          tr:nth-child(even) {
            background-color: #fafafa;
          }
          @media print {
            body { margin: 0; padding: 0; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
          }
        </style>
      </head>
      <body>
        <h2>Task List</h2>
        <div class="timestamp">Printed on: ${currentDate}</div>
        ${tableHTML}
      </body>
    </html>
  `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 600);
  };

 function downloadCSV(array) {
  if (!array || array.length === 0) return;

  // Flatten the data
  const flatArray = array.map((obj) => {
    const flat = { ...obj };

    if (flat.assigned_to && typeof flat.assigned_to === "object") {
      flat.assigned_to = flat.assigned_to.name;
    }

    if (flat.created_by && typeof flat.created_by === "object") {
      flat.created_by = flat.created_by.name;
    }

    return flat;
  });

  const headers = Object.keys(flatArray[0]).map((h) => h.toUpperCase());

  const csvContent = [
    headers.join(","),
    ...flatArray.map((obj) => Object.values(obj).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, "export.csv");
}



  // ✅ Export to Excel
 function downloadExcel(array) {
  if (!array || array.length === 0) return;

  const newArray = array.map((obj) => {
    const transformed = {};

    Object.keys(obj).forEach((key) => {
      let value = obj[key];

      // Replace nested object with name
      if (key === "assigned_to" && value && typeof value === "object") {
        value = value.name;
      }

      if (key === "created_by" && value && typeof value === "object") {
        value = value.name;
      }

      transformed[key.toUpperCase()] = value;
    });

    return transformed;
  });

  const worksheet = XLSX.utils.json_to_sheet(newArray);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

  XLSX.writeFile(workbook, "export.xlsx");
}



  // ✅ Export to PDF
  function downloadPDF(array) {
    if (!array || array.length === 0) {
      alert("No data available to export!");
      return;
    }

    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: "A4",
      });

      const allKeys = Array.from(
        new Set(array.flatMap((obj) => Object.keys(obj)))
      );

      const rows = array.map((obj) =>
        allKeys.map((key) => {
          const value = obj[key];
          if (typeof value === "object" && value !== null)
            return value.name || value.label || JSON.stringify(value);
          return value ?? "";
        })
      );

      doc.setFontSize(13);
      doc.text("Exported Data", 40, 40);

      autoTable(doc, {
        head: [allKeys],
        body: rows,
        startY: 60,
        styles: { fontSize: 9, cellPadding: 4, overflow: "linebreak" },
        headStyles: {
          fillColor: [230, 230, 230],
          textColor: 20,
          fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        theme: "grid",
        margin: { left: 40, right: 40 },
        tableWidth: "auto",
      });

      doc.save("export.pdf");
    } catch (error) {
      console.error("PDF Export Error:", error);
      alert("Something went wrong while exporting PDF!");
    }
  }

  // ✅ Copy to Clipboard
  function copyToClipboard(array) {
    if (!array || array.length === 0) return;

    const csvContent = [
      Object.keys(array[0]).join("\t"),
      ...array.map((obj) => Object.values(obj).join("\t")),
    ].join("\n");

    navigator.clipboard
      .writeText(csvContent)
      .then(() => alert("Data copied to clipboard ✅"))
      .catch((err) => console.error("Failed to copy: ", err));
  }

  return (
    <div className="invoice-list-table-header w-100 me-1 ms-50 mt-2 mb-75">
      <Row>
        <Col xl="6" className="d-flex align-items-center p-0">
          <div className="d-flex align-items-center w-100">
            <label htmlFor="rows-per-page">Show</label>
            <Input
              className="mx-50"
              type="select"
              id="rows-per-page"
              value={rowsPerPage}
              onChange={handlePerPage}
              style={{ width: "5rem" }}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </Input>
            <label htmlFor="rows-per-page">Entries</label>
          </div>
        </Col>
        <Col
          xl="6"
          className="d-flex align-items-sm-center justify-content-xl-end justify-content-start flex-xl-nowrap flex-wrap flex-sm-row flex-column pe-xl-1 p-0 mt-xl-0 mt-1"
        >
          <div className="d-flex align-items-center mb-sm-0 mb-1 me-1">
            <label className="mb-0" htmlFor="search-invoice">
              Search:
            </label>
            <Input
              id="search-invoice"
              className="ms-50 w-100"
              type="text"
              value={searchTerm}
              onChange={(e) => handleFilter(e.target.value)}
            />
          </div>

          <div className="d-flex align-items-center table-header-actions">
            <UncontrolledDropdown className="me-1">
              <DropdownToggle color="secondary" caret outline>
                <Share className="font-small-4 me-50" />
                <span className="align-middle">Export</span>
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem className="w-100" onClick={handlePrint}>
                  <Printer className="font-small-4 me-50" />
                  <span className="align-middle">Print</span>
                </DropdownItem>
                <DropdownItem
                  className="w-100"
                  onClick={() => downloadCSV(store.allData)}
                >
                  <FileText className="font-small-4 me-50" />
                  <span className="align-middle">CSV</span>
                </DropdownItem>
                <DropdownItem
                  className="w-100"
                  onClick={() => downloadExcel(store.allData)}
                >
                  <Grid className="font-small-4 me-50" />
                  <span className="align-middle">Excel</span>
                </DropdownItem>
                {/* <DropdownItem className="w-100" onClick={() => downloadPDF(store.allData)}>
                  <File className="font-small-4 me-50" />
                  <span className="align-middle">PDF</span>
                </DropdownItem> */}
                <DropdownItem
                  className="w-100"
                  onClick={() => copyToClipboard(store.allData)}
                >
                  <Copy className="font-small-4 me-50" />
                  <span className="align-middle">Copy</span>
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
            {tabtype !== "report" && (
              <>
                {tabtype === "task" ? (
                  userData?.is_task_create ? (
                    <Button
                      className="add-new-user"
                      color="primary"
                      onClick={toggleSidebar}
                    >
                      Add New Task
                    </Button>
                  ) : null
                ) : (
                  <Button
                    className="add-new-user"
                    color="primary"
                    onClick={toggleSidebar}
                  >
                    {tabtype === "designation"
                      ? "Add New Designation"
                      : "Add New User"}
                  </Button>
                )}
              </>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
};

const UsersList = () => {
  // ** Store Vars
  const { tabtype } = useParams();
  console.log("tabtype", tabtype);
  const dispatch = useDispatch();
  const store = useSelector((state) => state.users);
  const userdata = useSelector((state) => state.auth.userData);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [userOptions, setUserOptions] = useState([]);
  const [showMyTasksOnly, setShowMyTasksOnly] = useState(true);

  const teamList = userdata?.team || [];
  const flattenTeam = (teamArray) => {
    let flat = [];
    teamArray.forEach((member) => {
      flat.push(member);
      if (member.subordinates && member.subordinates.length > 0) {
        flat = flat.concat(flattenTeam(member.subordinates));
      }
    });
    return flat;
  };
  useEffect(() => {
    const flatTeam = flattenTeam(teamList || []);

    const formattedOptions = flatTeam.map((user) => ({
      value: user.id,
      label:
        user.first_name && user.last_name ? `${user.first_name}` : user.email,
    }));

    setUserOptions(formattedOptions);
  }, [teamList]);

  console.log("st111", store);
  // ** States
  const [sort, setSort] = useState("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState("id");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState({
    value: "",
    label: "Select Role",
  });
  const [currentPlan, setCurrentPlan] = useState({
    value: "",
    label: "Select Plan",
  });
  const [currentStatus, setCurrentStatus] = useState({
    value: "",
    label: "Select Status",
    number: 0,
  });

  // ** Function to toggle sidebar
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  // Get user data
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");

  // ** Get data on mount
 useEffect(() => {
  let endpoint = "";
  let queryParams = {};

  if (tabtype === "designation") {
    endpoint = "designation/";
  } else if (tabtype === "task" || tabtype === "report") {
    endpoint = "task/";

    const userId = userdata?.id;
     // ✅ Always include permission flag

    // ✅ For report tab — assigned tasks to current user
    if (tabtype === "report" && userId) {
      queryParams.assigned_to = userId;
    }

    // ✅ For task tab
    if (tabtype === "task" && userId) {
      if (showMyTasksOnly) {
        // when checkbox checked → show tasks assigned to me
        queryParams.assigned_to = userId;
      } else {
        // when unchecked → show tasks I created
        queryParams.created_by = userId;
      }
    }

    // ✅ Apply additional filters if selected
    if (selectedStatus) queryParams.status = selectedStatus;
    if (selectedUser) queryParams.assigned_to = selectedUser;
  } else {
    endpoint = "user/";
  }

  dispatch(getAllData({ endpoint, queryParams }));
}, [
  dispatch,
  tabtype,
  userdata,
  selectedStatus,
  selectedUser,
  showMyTasksOnly, // ✅ re-fetch when toggled
]);


  // ** User filter options
  const roleOptions = [
    { value: "", label: "Select Role" },
    { value: "admin", label: "Admin" },
    { value: "author", label: "Author" },
    { value: "editor", label: "Editor" },
    { value: "maintainer", label: "Maintainer" },
    { value: "subscriber", label: "Subscriber" },
  ];

  const planOptions = [
    { value: "", label: "Select Plan" },
    { value: "basic", label: "Basic" },
    { value: "company", label: "Company" },
    { value: "enterprise", label: "Enterprise" },
    { value: "team", label: "Team" },
  ];

  const statusOptions = [
    { value: "", label: "Select Status", number: 0 },
    { value: "pending", label: "Pending", number: 1 },
    { value: "active", label: "Active", number: 2 },
    { value: "inactive", label: "Inactive", number: 3 },
  ];

  const handleFilter = (val) => {
    setSearchTerm(val.toLowerCase());
    setCurrentPage(1); // reset to page 1 after search
  };

  // ✅ Handle pagination locally
  const handlePerPage = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handlePagination = (page) => {
    setCurrentPage(page.selected + 1);
  };

  // ✅ Client-side data filtering & pagination
  const filteredData =
    store?.allData?.filter((item) => {
      if (!searchTerm) return true;

      return Object.values(item).some((value) =>
        String(value).toLowerCase().includes(searchTerm)
      );
    }) || [];

  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const paginatedData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const pageCount = Math.ceil(filteredData.length / rowsPerPage);

  // ** Function in get data on page change
  // const handlePagination = page => {
  //   dispatch(
  //     getData({
  //       sort,
  //       sortColumn,
  //       q: searchTerm,
  //       perPage: rowsPerPage,
  //       page: page.selected + 1,
  //       role: currentRole.value,
  //       status: currentStatus.value,
  //       currentPlan: currentPlan.value
  //     })
  //   )
  //   setCurrentPage(page.selected + 1)
  // }

  // // ** Function in get data on rows per page
  // const handlePerPage = e => {
  //   const value = parseInt(e.currentTarget.value)
  //   dispatch(
  //     getData({
  //       sort,
  //       sortColumn,
  //       q: searchTerm,
  //       perPage: value,
  //       page: currentPage,
  //       role: currentRole.value,
  //       currentPlan: currentPlan.value,
  //       status: currentStatus.value
  //     })
  //   )
  //   setRowsPerPage(value)
  // }

  // // ** Function in get data on search query change
  // const handleFilter = val => {
  //   setSearchTerm(val)
  //   dispatch(
  //     getData({
  //       sort,
  //       q: val,
  //       sortColumn,
  //       page: currentPage,
  //       perPage: rowsPerPage,
  //       role: currentRole.value,
  //       status: currentStatus.value,
  //       currentPlan: currentPlan.value
  //     })
  //   )
  // }

  // ** Custom Pagination
  const CustomPagination = () => (
    <ReactPaginate
      previousLabel={""}
      nextLabel={""}
      pageCount={pageCount}
      activeClassName="active"
      forcePage={currentPage - 1}
      onPageChange={handlePagination}
      pageClassName={"page-item"}
      nextLinkClassName={"page-link"}
      nextClassName={"page-item next"}
      previousClassName={"page-item prev"}
      previousLinkClassName={"page-link"}
      pageLinkClassName={"page-link"}
      containerClassName={
        "pagination react-paginate justify-content-end my-2 pe-1"
      }
    />
  );

  // ** Table data to render
  const dataToRender = () => {
    const filters = {
      role: currentRole.value,
      currentPlan: currentPlan.value,
      status: currentStatus.value,
      q: searchTerm,
    };

    const isFiltered = Object.keys(filters).some(function (k) {
      return filters[k].length > 0;
    });

    if (store.allData.length > 0) {
      return store.allData;
    } else if (store.allData.length === 0 && isFiltered) {
      return [];
    } else {
      return store.allData.slice(0, rowsPerPage);
    }
  };

  const handleSort = (column, sortDirection) => {
    setSort(sortDirection);
    setSortColumn(column.sortField);
    dispatch(
      getData({
        sort,
        sortColumn,
        q: searchTerm,
        page: currentPage,
        perPage: rowsPerPage,
        role: currentRole.value,
        status: currentStatus.value,
        currentPlan: currentPlan.value,
      })
    );
  };
  const columns = getColumns(tabtype);

  return (
    <Fragment>
      {/* <Card>
        <CardHeader>
          <CardTitle tag='h4'>Filters</CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            <Col md='4'>
              <Label for='role-select'>Role</Label>
              <Select
                isClearable={false}
                value={currentRole}
                options={roleOptions}
                className='react-select'
                classNamePrefix='select'
                theme={selectThemeColors}
                onChange={data => {
                  setCurrentRole(data)
                  dispatch(
                    getData({
                      sort,
                      sortColumn,
                      q: searchTerm,
                      role: data.value,
                      page: currentPage,
                      perPage: rowsPerPage,
                      status: currentStatus.value,
                      currentPlan: currentPlan.value
                    })
                  )
                }}
              />
            </Col>
            <Col className='my-md-0 my-1' md='4'>
              <Label for='plan-select'>Plan</Label>
              <Select
                theme={selectThemeColors}
                isClearable={false}
                className='react-select'
                classNamePrefix='select'
                options={planOptions}
                value={currentPlan}
                onChange={data => {
                  setCurrentPlan(data)
                  dispatch(
                    getData({
                      sort,
                      sortColumn,
                      q: searchTerm,
                      page: currentPage,
                      perPage: rowsPerPage,
                      role: currentRole.value,
                      currentPlan: data.value,
                      status: currentStatus.value
                    })
                  )
                }}
              />
            </Col>
            <Col md='4'>
              <Label for='status-select'>Status</Label>
              <Select
                theme={selectThemeColors}
                isClearable={false}
                className='react-select'
                classNamePrefix='select'
                options={statusOptions}
                value={currentStatus}
                onChange={data => {
                  setCurrentStatus(data)
                  dispatch(
                    getData({
                      sort,
                      sortColumn,
                      q: searchTerm,
                      page: currentPage,
                      status: data.value,
                      perPage: rowsPerPage,
                      role: currentRole.value,
                      currentPlan: currentPlan.value
                    })
                  )
                }}
              />
            </Col>
          </Row>
        </CardBody>
      </Card> */}

      <Card className="overflow-hidden">
        <div className="react-dataTable">
          {console.log("Users Store:", store)}
          {tabtype === "report" && (
            <div className="d-flex gap-2 align-items-center flex-wrap p-1">
              <div>
                <Label for="task-status" className="me-1">
                  Status:
                </Label>
                <Select
                  id="task-status"
                  className="react-select"
                  classNamePrefix="select"
                  value={
                    selectedStatus
                      ? {
                          value: selectedStatus,
                          label: selectedStatus.replace("_", " "),
                        }
                      : null
                  }
                  options={[
                    { value: "pending", label: "Pending" },
                    { value: "in_progress", label: "In Progress" },
                    { value: "completed", label: "Completed" },
                  ]}
                  onChange={(opt) => setSelectedStatus(opt?.value || "")}
                  isClearable
                />
              </div>

              <div>
                <Label for="user-team" className="me-1">
                  Assigned To:
                </Label>
                <Select
                  id="user-team"
                  className="react-select"
                  classNamePrefix="select"
                  value={
                    userOptions.find((u) => u.value === selectedUser) || null
                  }
                  options={userOptions}
                  onChange={(opt) => setSelectedUser(opt?.value || "")}
                  isClearable
                />
                {console.log("userOptions", userOptions)}
              </div>
            </div>
          )}
          {tabtype === "task" &&
            userdata?.is_task_recive &&
            userdata?.is_task_create && (
              <div className="d-flex gap-2 align-items-center flex-wrap p-1">
                <div className="d-flex align-items-center">
                  <Input
                    type="checkbox"
                    id="show-my-tasks"
                    className="me-50"
                    checked={showMyTasksOnly}
                    onChange={(e) => setShowMyTasksOnly(e.target.checked)}
                  />
                  <Label htmlFor="show-my-tasks" className="mb-0">
                    Show My Tasks Only
                  </Label>
                </div>
              </div>
            )}

          <DataTable
            noHeader
            subHeader
            sortServer={false}
            pagination
            responsive
            paginationServer
            columns={columns}
            onSort={handleSort}
            sortIcon={<ChevronDown />}
            className="react-dataTable"
            paginationComponent={CustomPagination}
            data={paginatedData}
            // subHeaderComponent={
            //   <CustomHeader
            //     store={store}
            //     searchTerm={searchTerm}
            //     rowsPerPage={rowsPerPage}
            //     handleFilter={handleFilter}
            //     handlePerPage={handlePerPage}
            //     toggleSidebar={toggleSidebar}
            //   />
            // }
            subHeaderComponent={
              <CustomHeader
                store={store}
                searchTerm={searchTerm}
                rowsPerPage={rowsPerPage}
                handleFilter={handleFilter}
                handlePerPage={handlePerPage}
                toggleSidebar={toggleSidebar}
              />
            }
          />
        </div>
      </Card>

      <Sidebar
        open={sidebarOpen}
        toggleSidebar={toggleSidebar}
        tabtype={tabtype}
      />
    </Fragment>
  );
};

export default UsersList;
