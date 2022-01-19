import React, { useContext, useState, useRef, useEffect } from "react";
import { Paper, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Box } from "@mui/system";
import { ClientsContext } from "../../contexts/ClientsContext";
import DataTable from "./projectList";
import {
  deleteClient,
  editClient,
  getClient,
} from "../../api/clients api/clients";

const useStyles = makeStyles((theme) => ({
  input: {
    color: "#000",
    width: "50%",
    maxWidth: "fit-content",
    height: "30px",
    fontSize: "30px",
    fontWeight: "bold",
    border: "none",
    background: "#fff",
    transition: "width 0.4s ease-in-out",
    "& :focus": { width: "100%" },
  },
}));
export default function Header(props) {
  const {
    // currentClient, \
    clientsList,
    ...others
  } = props;
  // to focus edit name of client
  // const {getClient,dispatchClientDetails}=useContext(ClientsContext)
  // getClient(dispatchClientDetails);
  const [clientName, setClientName] = useState("");

  const inputRef = useRef();
  const handleEditClick = (e) => {
    inputRef.current.focus();
  };

  const classes = useStyles();
  const {
    currentClient,
    changeClient,
    dispatchDeleteClient,
    clientProjectDetails,
    dispatchClientProjectDetails,
    dispatchEditClient,
    dispatchClientDetails,
    clientDetails,
  } = useContext(ClientsContext);
  let projectList = [];
  useEffect(async () => {
    // getClientPro(JSON.stringify(id));
    setClientName(currentClient?.name);
  }, [currentClient]);
  if (clientDetails?.loader === false) {
    projectList = currentClient?.projects;
  }
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log(currentClient);
      if (clientName !== "") {
        const data = [currentClient._id, { name: clientName }];
        await editClient(data, dispatchEditClient);
        await getClient(dispatchClientDetails);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeleteClient = async (e) => {
    try {
      const data = currentClient._id;
      const clientIndex = clientsList.findIndex(
        (i) => i._id === currentClient._id
      );
      const lastIn = clientsList.indexOf(clientsList.slice(-1)[0])
        ? clientsList.indexOf(clientsList.slice(-1)[0])
        : 0;
      await deleteClient(data, dispatchDeleteClient);
      await getClient(dispatchClientDetails);
      if (clientIndex === lastIn) {
        changeClient(clientsList[lastIn - 1]);
      } else {
        changeClient(clientsList[lastIn + 1]);
      }
      console.log(currentClient);
    } catch (err) {
      console.log(err);
    }
  };
  return currentClient === "" ? (
    <Box
      component="div"
      sx={{
        width: "70%",
        flexGrow: "1",
        overflowX: "hidden",
        overflowY: "auto",
        // margin: "10px 10px 10px 10px",
      }}
    >
      <Paper
        component="div"
        elevation={3}
        sx={{
          display: "flex",
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
          // ml: 2,
          overflow: "visible",
          height: "100%",
        }}
      >
        <Box
          component="img"
          src="/svgs/client.svg"
          sx={{ width: 100, height: 70, backgroundColor: "white" }}
        />
        <Typography variant="h5">No Client Selected</Typography>
      </Paper>
    </Box>
  ) : (
    <>
      {/* grid container 40 60 */}
      <Box
        component="div"
        sx={{
          width: "70%",
          flexGrow: "1",
          overflowX: "hidden",
          overflowY: "auto",
          margin: "10px 10px 10px 0",
        }}
      >
        <Paper
          component="div"
          elevation={3}
          sx={{
            overflow: "visible",
            height: "100%",
            position: "relative",
            display: "grid",
            gridTemplateRows: "30% 70%",
          }}
        >
          <Box sx={{ m: 1 }}>
            <h1 style={{ backgroundColor: "#fff" }}>
              <form onSubmit={handleEditSubmit} style={{ display: "inline" }}>
                <input
                  ref={inputRef}
                  onChange={(e) => setClientName(e.target.value)}
                  type="text"
                  className={classes.input}
                  value={clientName}
                />
              </form>
              <div
                style={{
                  float: "right",
                }}
              >
                <EditIcon sx={{ mr: 2 }} onClick={handleEditClick} />
                <DeleteIcon sx={{ mr: 3 }} onClick={handleDeleteClient} />
              </div>
            </h1>
            <Typography sx={{}} variant="subtitle1">
              Assign Projects
            </Typography>
          </Box>

          <Box sx={{ m: 1 }}>
            <h2 style={{}}>Assigned Projects</h2>
            <Box
              component="div"
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                alignItems: "flex-start",
                m: 1,
              }}
            >
              {/* {projectList?.map((project) => (
                <Typography variant="subtitle1" sx={{ width: 1 }}>
                  {project.name}
                  <span style={{ float: "right" }}>{project.rate} rs/hr</span>
                </Typography>
              ))} */}
              <DataTable />
            </Box>
          </Box>
        </Paper>
      </Box>
    </>
  );
}
