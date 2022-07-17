/* eslint-disable consistent-return */
import React, { useContext, useEffect, useState, useRef } from "react";
import { Paper, Typography, CircularProgress } from "@mui/material";
import { LoadingButton, TreeItem, TreeView } from "@mui/lab";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { makeStyles } from "@mui/styles";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import SearchBar from "../SearchBar";
import axios from "axios";
//-------------------------------------------------------------------------------------------------------------------
const useStyles = makeStyles((theme) => ({
  root: {},
}));

export default function Sidebar() {
  const classes = useStyles();
  const [taskList, setTaskList] = useState([]);

  // fetch tasks
  useEffect(() => {
    axios
      .get(`/task`)
      .then((result) => {
        console.log(result);
        setTaskList(result?.data?.data);

        return result;
      })
      .catch((error) => {
        console.error(error);
        setTaskList([]);
        return Promise.reject(error);
      });
  }, []);

  return (
    <Box
      component="div"
      sx={{
        margin: "10px",
        // height: "70vh",
        flexGrow: "1",
        display: "flex",
        flexDirection: "row",
        scrollbar: "auto",
      }}
    >
      <Paper
        component="div"
        elevation={3}
        sx={{
          overflow: "hidden",
          height: "100%",
          width: "28.5%",
          display: "flex",
          flexDirection: "column",
          // position: "relative",
        }}
      >
        {/* search box */}
        <Box
          sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}
        >
          <SearchBar
            handleSearch={handleSearch}
            label="Search Project"
            options={projectList}
          />
        </Box>
        {clientDetails?.client?.loader && (
          <Box
            sx={{
              display: "flex",
              flexGrow: "1",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {/* clients and project tree view flex container */}
        {!clientDetails?.loader && (
          <Box
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
              aria-label="file system navigator"
              defaultCollapseIcon={<ExpandMoreIcon />}
              defaultExpandIcon={<ChevronRightIcon />}
              sx={{
                height: 240,
                flexGrow: 1,
                // maxWidth: 400,
                overflowY: "auto",
                width: "100%",
              }}
              className={classes.root}
              expanded={expanded}
              selected={selected}
              onNodeToggle={handleToggle}
              onNodeSelect={handleSelect}
            >
              {clientsList?.length > 0 &&
                clientsList.map((client) => (
                  <TreeItem
                    nodeId={client._id.toString()}
                    label={
                      <Typography
                        sx={{
                          color: "#637381",
                          fontSize: "1.5rem",
                          fontWeight: "700",
                        }}
                      >
                        {client.name}
                      </Typography>
                    }
                    key={client._id}
                    onClick={handleClick}
                    id={client._id}
                  >
                    {client.projects.map((project) => {
                      return (
                        <TreeItem
                          id={client._id + project._id}
                          nodeId={(project._id + client._id).toString()}
                          key={project._id}
                          label={
                            <Typography
                              sx={{
                                color: "#2a3641",
                                fontSize: "1.2rem",
                                fontWeight: "700",
                              }}
                              data-client={client.name}
                              data-project={project.name}
                              onClick={handleProjectClick}
                            >
                              {project.name}
                            </Typography>
                          }
                        />
                      );
                    })}
                  </TreeItem>
                ))}
            </TreeView>
          </Box>
        )}

        <Box
          sx={{
            boxSizing: "border-box",
            width: "95%",
            "& > :not(style)": { m: 1 },
          }}
        >
          {loginC && Role.indexOf(loginC.userData.role) <= 2 && (
            <form
              onSubmit={handleSubmit}
              noValidate
              autoComplete="off"
              style={{ width: "100%" }}
            >
              <TextField
                inputRef={searchRef}
                onChange={(e) => setnewProjectValue(e.target.value)}
                required
                fullWidth
                label="Add new project"
                error={newClientError}
                sx={{}}
              />

              <LoadingButton
                fullWidth
                type="submit"
                loading={loaderAddProject}
                loadingPosition="end"
                variant="contained"
                sx={{ mt: 1 }}
              >
                Add Project
              </LoadingButton>
            </form>
          )}
        </Box>
      </Paper>
      <Header
        clientsList={clientsList}
        currentClient={newClientValue}
        currentProject={newProjectValue}
        setcurrClient={changeClient}
        setCurrProjct={changeProject}
      />
    </Box>
    /* {open === true ? (
        <Snackbars
          sx={{ display: "none", position: "absolute", zIndex: -10000 }}
          message={"hello"}
          open={open}
          setOpen={(val) => {
            setOpen(val);
          }}
        />
      ) : (
        ""
      )} */
  );
}
