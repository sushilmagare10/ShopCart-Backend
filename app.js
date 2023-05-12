const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

const globalErrorHandler = require("./middleware/errors");
dotenv.config();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

//Routes
const product = require("./routes/productRoute");
const user = require("./routes/usersRoute");
const order = require("./routes/orderRoute");
const cart = require("./routes/cartRoute");
const stripe = require("./routes/stripeRoute");

app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", order);
app.use("/api/v1", cart);
app.use("/api/v1", stripe);

// Error Middleware
app.use(globalErrorHandler);

module.exports = app;
