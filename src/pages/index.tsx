import React, { useState } from "react";
import { Button, TextField, Grid } from "@material-ui/core";
import { useQuery, useMutation, gql } from "@apollo/client";
import { navigate, navigateTo } from "gatsby";
import "./style.css";

type dataType = {
  id: string;
  name: string;
  url: string;
};

const GET_BOOKMARK = gql`
  query {
    bookmark {
      id
      name
      url
    }
  }
`;

const ADD_BOOKMARK = gql`
  mutation addBookmark($name: String!, $url: String!) {
    addBookmark(name: $name, url: $url) {
      id
      name
      url
    }
  }
`;

const REMOVE_BOOKMARK = gql`
  mutation removeBookmark($id: ID!) {
    removeBookmark(id: $id) {
      id
      name
      url
    }
  }
`;

const Home = () => {
  const [name, setName] = useState<string>("");
  const [siteUrl, setSiteURl] = useState<string>("");
  const [addBookmark] = useMutation(ADD_BOOKMARK);
  const [removeBookmark] = useMutation(REMOVE_BOOKMARK);

  const add = () => {
    console.log("NAme: ", name);
    console.log("URL : ", siteUrl);
    addBookmark({
      variables: {
        name: name,
        url: siteUrl,
      },
      refetchQueries: [{ query: GET_BOOKMARK }],
    });
  };

  const remove = (id: string) => {
    removeBookmark({
      variables: {
        id: id,
      },
      refetchQueries: [{ query: GET_BOOKMARK }],
    });
  };

  const { loading, error, data } = useQuery(GET_BOOKMARK);
  return (
    <div className="main">
      <h1>BOOKMARK APP</h1>
      <div className="inputArea">
        <Grid container spacing={3} alignItems="center" direction="column">
          <Grid item md={6} sm={8} xs={10}>
            <TextField
              id="filled-text1"
              label="Name"
              variant="outlined"
              name={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item md={6} sm={8} xs={10}>
            <TextField
              id="filled-text2"
              label="URL"
              variant="outlined"
              name={siteUrl}
              onChange={(e) => setSiteURl(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item md={6} sm={8} xs={10}>
            <Button
              variant="contained"
              color="secondary"
              size="medium"
              onClick={add}
            >
              ADD TO BOOKMARK
            </Button>
          </Grid>
        </Grid>
      </div>
      {console.log(data && data.bookmark)}
      <Grid container spacing={1} direction="column" justify="center">
        {data &&
          data.bookmark.map((d: dataType) => {
            return (
              <Grid item md={6} sm={8} xs={10} key={d.id}>
                <div className="dataList">
                  <h3>{d.name}</h3>
                  <a href={d.url}>{d.url}</a>

                  <div className="listBtn">
                    <Button
                      onClick={() => remove(d.id)}
                      variant="contained"
                      color="secondary"
                    >
                      Remove
                    </Button>
                    <Button
                      onClick={() => navigateTo(d.url)}
                      variant="contained"
                      color="secondary"
                    >
                      Visit
                    </Button>
                  </div>
                </div>
              </Grid>
            );
          })}
      </Grid>
    </div>
  );
};

export default Home;
