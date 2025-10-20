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

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // ** Store Vars
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.accessToken); // get token from Redux
  console.log("state.auth", token);

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
    formState: { errors },
  } = useForm({
    defaultValues:
      tabtype === "designation"
        ? { name: "" } // designation form
        : defaultValues,
  });

  // ** Function to handle form submit
  const onSubmit = async (data) => {
    setData(data);
    console.log("da", data);
    if (tabtype === "designation") {
      if (data.name.length > 0) {
        try {
          const res = await axios.post(
            "https://lspschoolerp.pythonanywhere.com/erp-api/designation/",
            { name: data.name },
            {
              headers: { Authorization: `Token ${token}` },
            }
          );
          console.log("Designation created:", res.data);
          setToastMessage("Designation created successfully!");
          setToastOpen(true);
          dispatch(getAllData({ endpoint: "designation/" }));
          toggleSidebar();
        } catch (err) {
          console.error("Error creating designation:", err.response || err);
        }
      } else {
        setError("name", { type: "manual" });
      }
    } else {
      try {
        const payload = {
          email: data.email,
          password: data.password,
          firstname: data.firstname,
          lastname: data.lastname,
          designation: role, // use selected designation ID
        };

        const res = await axios.post(
          "https://lspschoolerp.pythonanywhere.com/erp-api/user/createuser/",
          payload,
          {
            headers: { Authorization: `Token ${token}` },
          }
        );

        console.log("User created:", res.data);
        setSuccessMessage("User created successfully!");
        // After user creation
        setToastMessage("User created successfully!");
        dispatch(getAllData({ endpoint: "user/" }));
        setToastOpen(true);

        toggleSidebar();
      } catch (err) {
        console.error("Error creating user:", err.response || err);
      }
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
          {tabtype === "designation" ? (
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
          ) : (
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
            </>
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
