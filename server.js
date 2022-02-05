/*********************************************************************************
 * WEB422 – Assignment 1
 * I declare that this assignment is my own work in accordance with Seneca Academic Policy.
 * No part of this assignment has been copied manually or electronically from any other source
 * (including web sites) or distributed to other students.
 *
 * Name: Jack Ma Student ID: 150150209 Date: 01/21/2022
 * Heroku Link: https://salty-depths-25560.herokuapp.com/
 *
 ********************************************************************************/

const express = require("express");
const path = require("path");
const cors = require("cors");
const { celebrate, Joi, errors, Segments } = require("celebrate");
const RestaurantDB = require("./modules/restaurantDB.js");

const db = new RestaurantDB();
const HTTP_PORT = process.env.PORT || 8080;

const app = express();
app.use(cors());
app.use(express.json());

db.initialize(
  "mongodb+srv://dbUser:pass122333@cluster0.aj0n5.mongodb.net/sample_restaurants?retryWrites=true&w=majority"
)
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log(`server listening on: ${HTTP_PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });

// ROUTES
// 201 created
// 204 no content
// 500 internal error

app.post("/api/restaurants", (req, res) => {
  db.addNewRestaurant(req.body)
    .then(() => {
      res.status(201).json(`New restaurant added!`);
    })
    .catch((err) => {
      res.status(500).json(`Error: ${err}`);
    });
});

// normal version
// app.get("/api/restaurants", (req, res) => {
//   db.getAllRestaurants(req.query.page, req.query.perPage, req.query.borough)
//     .then((restaurants) => {
//       res.status(200).json(restaurants);
//     })
//     .catch((err) => {
//       res.status(500).json(`Error: ${err}`);
//     });
// });

// extra version
app.get(
  "/api/restaurants",
  celebrate({
    [Segments.QUERY]: Joi.object().keys({
      page: Joi.number().required(),
      perPage: Joi.number().required(),
      borough: Joi.string(),
    }),
  }),
  (req, res) => {
    db.getAllRestaurants(req.query.page, req.query.perPage, req.query.borough)
      .then((restaurants) => {
        res.status(200).json(restaurants);
      })
      .catch((err) => {
        res.status(500).json(`Error: ${err}`);
      });
  }
);

app.use((error, req, res, next) => {
  if (error.joi) {
    return res.status(400).json({
      error: error.joi.message,
    });
  }
  return res.status(500).send(error);
});

app.get("/api/restaurants/:_id", (req, res) => {
  db.getRestaurantById(req.params._id)
    .then((restaurants) => {
      res.status(200).json(restaurants);
    })
    .catch((err) => {
      res.status(500).json(`Error: ${err}`);
    });
});

app.put("/api/restaurants/:_id", (req, res) => {
  db.updateRestaurantById(req.body, req.params._id)
    .then(() => {
      res.status(200).json(`Restaurant (${req.params._id}) updated!`);
    })
    .catch((err) => {
      res.status(500).json(`Error: ${err}`);
    });
});

app.delete("/api/restaurants/:_id", (req, res) => {
  db.deleteRestaurantById(req.params._id)
    .then(() => {
      res.status(200).json(`Restaurant (${req.params._id}) deleted!`);
    })
    .catch((err) => {
      res.status(500).json(`Error: ${err}`);
    });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./index.html"));
});
