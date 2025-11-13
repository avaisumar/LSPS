// ** React Import
import { useEffect, useState } from "react";

// ** Custom Components
import Sidebar from "@components/sidebar";

// ** Utils
import { selectThemeColors } from "@utils";

// ** Third Party Components
import Select from "react-select";
import classnames from "classnames";
import { useForm, Controller } from "react-hook-form";

// ** Reactstrap Imports
import {
  Button,
  Label,
  FormText,
  Form,
  Input,
  Alert,
  Toast,
  ToastHeader,
  ToastBody,
} from "reactstrap";

// ** Store & Actions
import { addUser, getAllData } from "../store";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";

const defaultValues = {
  email: "",
  password: "",
  designation: "",
  firstname: "",
  lastname: "",
};

const countryOptions = [
  { label: "Australia", value: "Australia" },
  { label: "Bangladesh", value: "Bangladesh" },
  { label: "Belarus", value: "Belarus" },
  { label: "Brazil", value: "Brazil" },
  { label: "Canada", value: "Canada" },
  { label: "China", value: "China" },
  { label: "France", value: "France" },
  { label: "Germany", value: "Germany" },
  { label: "India", value: "India" },
  { label: "Indonesia", value: "Indonesia" },
  { label: "Israel", value: "Israel" },
  { label: "Italy", value: "Italy" },
  { label: "Japan", value: "Japan" },
  { label: "Korea", value: "Korea" },
  { label: "Mexico", value: "Mexico" },
  { label: "Philippines", value: "Philippines" },
  { label: "Russia", value: "Russia" },
  { label: "South", value: "South" },
  { label: "Thailand", value: "Thailand" },
  { label: "Turkey", value: "Turkey" },
  { label: "Ukraine", value: "Ukraine" },
  { label: "United Arab Emirates", value: "United Arab Emirates" },
  { label: "United Kingdom", value: "United Kingdom" },
  { label: "United States", value: "United States" },
];

const checkIsValid = (data) => {
  return Object.values(data).every((field) =>
    typeof field === "object" ? field !== null : field.length > 0
  );
};

const SidebarNewUsers = ({ open, toggleSidebar, tabtype }) => {
  // ** States
  const [data, setData] = useState(null);
  const [plan, setPlan] = useState("basic");
  const [role, setRole] = useState("");
  const [designations, setDesignations] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [permissions, setPermissions] = useState({
    is_report: false,
    is_task_recive: false,
    is_task_create: false,
  });

  const handlePermissionChange = (key) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ** Store Vars
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.accessToken); // get token from Redux
  console.log("state.auth", token);
  const userdata = useSelector((state) => state.auth.userData);
    const allData = useSelector((state) => state.users.allData);

  console.log("allData",allData)
  const teamList = userdata?.team || [];
  const [teamMembers, setTeamMembers] = useState([]);
  console.log("teamList", teamList);

  useEffect(() => {
    console.log("enter");
    if (open && tabtype !== "designation") {
      axios
        .get("https://lspschoolerp.pythonanywhere.com/erp-api/designation/", {
          headers: {
            Authorization: `Token ${token}`, // add token here
          },
        }) // replace with your API
        .then((res) => {
          console.log("res", res);
          setDesignations(res.data);
          // assuming API returns [{id:1, name:"Admin"}, ...]
        })
        .catch((err) => console.log(err));
    }
  }, [open, tabtype]);
  console.log("des", designations);
  useEffect(() => {
    if (designations.length > 0 && tabtype !== "designation") {
      setRole(designations[0].id); // default select first designation
    }
  }, [designations, tabtype]);
  // ** Vars
  const {
    control,
    setValue,
    setError,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues:
      tabtype === "designation"
        ? { name: "" } // designation form
        : defaultValues,
  });

  // Recursively flatten nested team/subordinates structure
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
    setTeamMembers(flatTeam);
  }, [teamList]);

  // ✅ Clear error message when user changes any field
useEffect(() => {
  const subscription = watch(() => {
    if (errorMessage) setErrorMessage("");
  });
  return () => subscription.unsubscribe();
}, [watch, errorMessage]);

  // ** Function to handle form submit
  const onSubmit = async (data) => {
    setErrorMessage(""); // clear previous errors
    try {
      if (tabtype === "designation") {
        if (data.name?.length > 0) {
          const res = await axios.post(
            "https://lspschoolerp.pythonanywhere.com/erp-api/designation/",
            { name: data.name },
            { headers: { Authorization: `Token ${token}` } }
          );
          console.log("Designation created:", res.data);
          setToastMessage("Designation created successfully!");
          setToastOpen(true);
          dispatch(getAllData({ endpoint: "designation/" }));
          toggleSidebar();
        } else setError("name", { type: "manual" });
      }

      // ✅ USER CREATION
      else if (tabtype === "user") {
        const payload = {
          email: data.email,
          password: data.password,
          firstname: data.firstname,
          lastname: data.lastname,
          designation: role,
          reporting_manager: data.reporting_manager || null,
          ...permissions, // ✅ add permissions here
        };

        const res = await axios.post(
          "https://lspschoolerp.pythonanywhere.com/erp-api/user/createuser/",
          payload,
          { headers: { Authorization: `Token ${token}` } }
        );

        console.log("User created:", res.data);
        setToastMessage("User created successfully!");
        setToastOpen(true);
        dispatch(getAllData({ endpoint: "user/" }));
        toggleSidebar();
      }

      // ✅ TASK CREATION
      else if (tabtype === "task") {
        const payload = {
          title: data.title,
          description: data.description,
          status: data.status,
          priority: data.priority,
          due_date: data.due_date,
          assigned_to: data.assigned_to,
        };

        const res = await axios.post(
          "https://lspschoolerp.pythonanywhere.com/erp-api/task/",
          payload,
          { headers: { Authorization: `Token ${token}` } }
        );

        console.log("Task created:", res.data);
        setToastMessage("Task created successfully!");
        setToastOpen(true);
        dispatch(getAllData({ endpoint: "task/" }));
        toggleSidebar();
      }
    } catch (err) {
      const msg =
    err.response?.data?.error ||
    err.response?.data?.error ||
    "Failed to complete request. Please try again.";
      setErrorMessage(msg); // show the message
      setToastOpen(false);
      console.error("Error creating record:", err.response || err);
    }
  };

  const handleSidebarClosed = () => {
    for (const key in defaultValues) {
      setValue(key, "");
    }
    // setRole("subscriber");
    setPlan("basic");
  };

  return (
    <>
      <Sidebar
        size="lg"
        open={open}
        title={tabtype === "designation" ? "Add Designation" : "New User"}
        headerClassName="mb-1"
        contentClassName="pt-0"
        toggleSidebar={toggleSidebar}
        onClosed={handleSidebarClosed}
      >
        <Form onSubmit={handleSubmit(onSubmit)}>
          {tabtype === "designation" && (
            <div className="mb-1">
              <Label className="form-label" for="designationName">
                Designation Name <span className="text-danger">*</span>
              </Label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input
                    id="designationName"
                    placeholder="Enter designation"
                    invalid={errors.name && true}
                    {...field}
                  />
                )}
              />
            </div>
          )}
          {tabtype === "task" && (
            <>
              <div className="mb-1">
                <Label className="form-label" for="taskTitle">
                  Task Title <span className="text-danger">*</span>
                </Label>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="taskTitle"
                      placeholder="Enter task title"
                      invalid={errors.title && true}
                      {...field}
                    />
                  )}
                />
              </div>

              <div className="mb-1">
                <Label className="form-label" for="taskDescription">
                  Description <span className="text-danger">*</span>
                </Label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="taskDescription"
                      type="textarea"
                      placeholder="Enter description"
                      invalid={errors.description && true}
                      {...field}
                    />
                  )}
                />
              </div>
              {/* Priority Dropdown */}
              <div className="mb-1">
                <Label className="form-label" for="priority">
                  Priority <span className="text-danger">*</span>
                </Label>
                <Controller
                  name="priority"
                  control={control}
                  defaultValue="medium"
                  render={({ field }) => (
                    <Input type="select" id="priority" {...field}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </Input>
                  )}
                />
              </div>

              {/* Due Date */}
              <div className="mb-1">
                <Label className="form-label" for="due_date">
                  Due Date <span className="text-danger">*</span>
                </Label>
                <Controller
                  name="due_date"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="date"
                      id="due_date"
                      invalid={errors.due_date && true}
                      {...field}
                    />
                  )}
                />
              </div>

              {/* Assigned To Dropdown */}
              <div className="mb-1">
                <Label className="form-label" for="assigned_to">
                  Assigned To <span className="text-danger">*</span>
                </Label>
                <Controller
                  name="assigned_to"
                  control={control}
                  render={({ field }) => (
                    <Input type="select" id="assigned_to" {...field}>
                      <option value="">Select Team Member</option>
                      {teamMembers.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.first_name}
                        </option>
                      ))}
                    </Input>
                  )}
                />
              </div>

              {/* <div className="mb-1">
                <Label className="form-label" for="taskStatus">
                  Status <span className="text-danger">*</span>
                </Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="select"
                      id="taskStatus"
                      {...field}
                      invalid={errors.status && true}
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </Input>
                  )}
                />
              </div> */}
            </>
          )}

          {tabtype === "user" && (
            <>
              <div className="mb-1">
                <Label className="form-label" for="fullName">
                  First Name <span className="text-danger">*</span>
                </Label>
                <Controller
                  name="firstname"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="firstname"
                      placeholder="John "
                      invalid={errors.firstname && true}
                      {...field}
                    />
                  )}
                />
              </div>
              <div className="mb-1">
                <Label className="form-label" for="username">
                  Last Name <span className="text-danger">*</span>
                </Label>
                <Controller
                  name="lastname"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="lastname"
                      placeholder="johnDoe99"
                      invalid={errors.lastname && true}
                      {...field}
                    />
                  )}
                />
              </div>
              <div className="mb-1">
                <Label className="form-label" for="userEmail">
                  Email <span className="text-danger">*</span>
                </Label>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="email"
                      id="email"
                      placeholder="john.doe@example.com"
                      invalid={errors.email && true}
                      {...field}
                    />
                  )}
                />
                <FormText color="muted">
                  You can use letters, numbers & periods
                </FormText>
              </div>

              <div className="mb-1">
                <Label className="form-label" for="user-role">
                  Designation <span className="text-danger">*</span>
                </Label>
                <Input
                  type="select"
                  id="designation"
                  name="designation"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  {designations?.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </Input>
              </div>
              <div className="mb-1">
                <Label className="form-label" for="reporting_manager">
                  Reporting Manager
                </Label>
                <Controller
                  name="reporting_manager"
                  control={control}
                  render={({ field }) => (
                    <Input type="select" id="reporting_manager" {...field}>
                      <option value="">Select Reporting Manager</option>
                      {allData?.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.first_name} 
                        </option>
                      ))}
                    </Input>
                  )}
                />
              </div>
              <div className="mb-1">
                <Label className="form-label" for="username">
                  Password <span className="text-danger">*</span>
                </Label>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="password"
                      id="password"
                      placeholder="*****"
                      invalid={errors.lastname && true}
                      {...field}
                    />
                  )}
                />
              </div>
              <div className="mb-1">
                <Label className="form-label">Permissions</Label>

                <div className="form-check">
                  <Input
                    type="checkbox"
                    id="is_report"
                    checked={permissions.is_report}
                    onChange={() => handlePermissionChange("is_report")}
                  />
                  <Label for="is_report" className="form-check-label ms-1">
                    Can Access Reports
                  </Label>
                </div>

                <div className="form-check">
                  <Input
                    type="checkbox"
                    id="is_task_recive"
                    checked={permissions.is_task_recive}
                    onChange={() => handlePermissionChange("is_task_recive")}
                  />
                  <Label for="is_task_recive" className="form-check-label ms-1">
                    Can Receive Tasks
                  </Label>
                </div>

                <div className="form-check">
                  <Input
                    type="checkbox"
                    id="is_task_create"
                    checked={permissions.is_task_create}
                    onChange={() => handlePermissionChange("is_task_create")}
                  />
                  <Label for="is_task_create" className="form-check-label ms-1">
                    Can Create Tasks
                  </Label>
                </div>
              </div>
            </>
          )}
          {errorMessage && (
            <Alert color="danger" className="mt-1">
              {errorMessage}
            </Alert>
          )}
          <Button type="submit" className="me-1" color="primary">
            Submit
          </Button>
          <Button
            type="reset"
            color="secondary"
            outline
            onClick={toggleSidebar}
          >
            Cancel
          </Button>
        </Form>
      </Sidebar>

      <div
        style={{ position: "fixed", top: "20px", right: "20px", zIndex: 9999 }}
      >
        {toastOpen && (
          <Toast isOpen={toastOpen} fade={true}>
            <ToastHeader toggle={() => setToastOpen(false)}>
              Success
            </ToastHeader>
            <ToastBody>{toastMessage}</ToastBody>
          </Toast>
        )}
      </div>
    </>
  );
};

export default SidebarNewUsers;
