/* eslint-disable consistent-return */
import React, { useContext, useRef, useEffect, useState } from "react";
import {
  Grid,
  List,
  Paper,
  Autocomplete,
  Typography,
  Button,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import TreeView from "@mui/lab/TreeView";
import TreeItem from "@mui/lab/TreeItem";
import { ClientsContext } from "../../contexts/ClientsContext";
import { addClient, getClient } from "../../api/clients api/clients";
import Header from "./Header";
//----------------------------------------------------------------------------------------------
const useStyles = makeStyles((theme) => ({
  root: {},
}));

export default function Sidebar() {
  const classes = useStyles();
  // const { } = useContext(ClientsContext);
  // state variable for input box to pass in as the new client value.
  const [newClientValue, setnewClientValue] = useState();
  const [newClientError, setnewClientError] = useState(false);
  const [defaultTextValue, setDefaultTextValue] = useState("");
  const inputRef = useRef("");
  const autocomRef = useRef("");
  const sidebarref = useRef("");
  const clientref = useRef("");
  // contexts

  const {
    clients,
    currentClient,
    changeClient,
    dispatchAddClient,
    // addClient,
    client,
    clientDetails,
    dispatchClientDetails,
  } = useContext(ClientsContext);

  let clientsList = [];
  const clientNameList = [];
  useEffect(() => {
    getClient(dispatchClientDetails);
  }, []);
  useEffect(async () => {
    try {
      const clientIndex = clientsList?.findIndex(
        (i) => i._id === currentClient?._id
      );
      // const projectIndex = clientsList[clientIndex]?.projects?.findIndex(
      //   (i) => i._id === currentProject?._id
      // );

      if (clientIndex !== null) {
        await changeClient(clientsList[clientIndex]);
        // await changeProject(clientsList[clientIndex]?.projects[projectIndex]);
      }
    } catch (err) {
      console.log(err);
    }
  }, [clientDetails]);
  if (clientDetails?.loader === false) {
    clientsList = clientDetails?.client?.data;
    clientDetails?.client?.data?.map((cli) => clientNameList.push(cli.name));
  }
  // labels for search box(autocomplete)
  // const clientsList = clients.map((client) => client.name);

  // change currentclient on search
  const handleSearch = (e, value) => {
    const client = clientsList.filter((client) =>
      client.name === e.target.textContent ? client : ""
    );
    if (client.length === 0) {
      // eslint-disable-next-line no-useless-return
    }
    changeClient(client[0]);
    console.log(sidebarref, clientref);

    // not working
    // sidebarref.current.scrollTop =
    //   500 + clientref.current.scrollHeight * clientsList.indexOf(client[0]);
  };

  const handleClick = (e) => {
    const client = clientsList.filter((client) =>
      client.name === e.target.textContent ? client : ""
    );
    changeClient(client[0]);
  };

  // add client in submit
  // not working properly , add proper validation Dr. Kamal Singh
  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      // if (
      //   clientsList.filter((cli) =>
      //     cli.name === newClientValue ? true : false
      //   )
      // ) {
      //   setnewClientError(true);
      //   return;
      // }
      // setnewClientError(false);
      if (newClientValue !== "") {
        await addClient(newClientValue, dispatchAddClient);
        await getClient(dispatchClientDetails);
        changeClient(() =>
          clientDetails.client.data.filter((cli) =>
            cli.name === newClientValue ? cli : ""
          )
        );
        inputRef.current.value = "";
        setnewClientValue("");
      } else {
        setnewClientError(true);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Box
      component="div"
      sx={{
        margin: "10px",
        // height: "70vh",
        flexGrow: "1",
        display: "flex",
        flexDirection: "row",
      }}
    >
      <Paper
        component="div"
        elevation={3}
        sx={{
          overflow: "hidden",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          // position: "relative",
        }}
      >
        {/* search box */}
        <Box
          sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}
        >
          {/* <SearchBar
            // inputRef={autocomRef}
            handleSearch={handleSearch}
            label="Search Clients"
            options={clientNameList}
          /> */}
          <Autocomplete
            disablePortal
            onChange={(e) => handleSearch(e)}
            id="combo-box-demo"
            options={clientNameList}
            sx={{ width: 300, m: 0.5 }}
            renderInput={(params) => (
              <TextField {...params} label="Search Client" />
            )}
          />
        </Box>

        {/* clients list flex container */}
        <Box
          ref={sidebarref}
          component="div"
          sx={{
            display: "flex",
            flexDirection: "column",
            flexGrow: "1",
            alignItems: "flex-start",
            overflowY: "auto",
          }}
        >
          <TreeView
            fullWidth
            // className={classes.root}
            sx={{
              height: 240,
              flexGrow: 1,
              // maxWidth: 400,
              overflowY: "auto",
              width: "100%",
            }}
          >
            {clientsList?.map((client) => (
              <TreeItem
                ref={clientref}
                onClick={handleClick}
                nodeId={client._id}
                className={classes.treeItem}
                label={<Typography variant="h6">{client.name}</Typography>}
              ></TreeItem>
            ))}
          </TreeView>
        </Box>

        {/* INPUT BOX, add validations, connect to context */}
        <Box
          sx={{
            boxSizing: "border-box",
            width: "95%",
            "& > :not(style)": { m: 1 },
          }}
        >
          <form
            onSubmit={handleSubmit}
            noValidate
            autoComplete="off"
            style={{ width: "100%" }}
          >
            <TextField
              sx={{ width: "100%" }}
              inputRef={inputRef}
              onChange={(e) => setnewClientValue(e.target.value)}
              required
              label="Add new client"
              error={newClientError}
            />
            <Button fullWidth type="submit" variant="contained" sx={{ mt: 1 }}>
              Submit
            </Button>
          </form>
        </Box>
      </Paper>
      <Header currentClient={currentClient} clientsList={clientsList} />
    </Box>
  );
}
