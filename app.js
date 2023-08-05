const users = [];
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
// getting-started.js
const mongoose = require("mongoose");
const dbname = "Toll-Plaza-Management-System";
const uri = `mongodb+srv://jhadeepesh3:nVb2hIdBBVuMd5Li@deepesh.jzjdlwj.mongodb.net/${dbname}?retryWrites=true&w=majority`;
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Setting up the session
app.use(
  session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false,
  })
);

// Initializing the passport
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(uri);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", () => {
  console.log("Connected successfully");
});

const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  zipCode: String,
});

const vehicleSchema = new mongoose.Schema({
  category: String,
  registeration_no: String,
  registeration_year: String,
  passID: String,
  chassis_no: String,
  vehicle_color: String,
});

const usersSchema = new mongoose.Schema({
  role: String,
  username: String,
  password: String,
});

const customersSchema = new mongoose.Schema({
  customerID: String,
  name: String,
  gender: String,
  dob: Date,
  email: String,
  phone: String,
  address: addressSchema,
  vehicle: vehicleSchema,
  drivingLicense: String,
  status: String,
});

const staffsSchema = new mongoose.Schema({
  staffID: String,
  name: String,
  gender: String,
  dob: Date,
  email: String,
  phone: String,
  address: addressSchema,
  status: String,
});

const adminSchema = new mongoose.Schema({
  adminID: String,
  name: String,
  gender: String,
  dob: Date,
  email: String,
  phone: String,
  address: addressSchema,
});

usersSchema.plugin(passportLocalMongoose);

const Address = mongoose.model("Address", addressSchema);
const Vehicle = mongoose.model("Vehicle", vehicleSchema);
const User = mongoose.model("User", usersSchema);
const Customer = mongoose.model("Customer", customersSchema);
const Staff = mongoose.model("Staff", staffsSchema);
const Admin = mongoose.model("Admin", adminSchema);
const TemporaryCustomer = mongoose.model("TemporaryCustomer", customersSchema);

passport.use(User.createStrategy());
passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    cb(null, { id: user.id, username: user.username, name: user.name });
  });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/signin", (req, res) => {
  res.render("signin");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/services", (req, res) => {
  res.render("services");
});

app.get("/add-vehicle", (req, res) => {
  res.render("vehicle-form");
});

app.get("/customers/:username", (req, res) => {
  Customer.findOne({ customerID: req.params.username }).then((foundUser) => {
    if (!foundUser) {
      res.render("home");
    } else {
      console.log(foundUser);
      if (foundUser.vehicle !== undefined) {
        res.render("profile", {
          user: foundUser,
          userType: "customer",
          vehicle: "Done",
        });
      } else {
        res.render("profile", {
          user: foundUser,
          userType: "customer",
          vehicle: "None",
        });
      }
    }
  });
});

app.get("/staffs/:username", (req, res) => {
  Staff.findOne({ staffID: req.params.username }).then((foundUser) => {
    if (!foundUser) {
      res.render("home");
    } else {
      res.render("profile", {
        user: foundUser,
        userType: "staff",
        vehicle: "None",
      });
    }
  });
});

app.get("/admin/:username", (req, res) => {
  Admin.findOne({ adminID: req.params.username }).then((foundUser) => {
    if (!foundUser) {
      res.render("Home");
    } else {
      res.render("profile", {
        user: foundUser,
        userType: "admin",
        vehicle: "None",
      });
    }
  });
});

app.get("/signup/admin", (req, res) => {
  const person = {
    may: "admin",
    maynot: "staff/customer",
    mayCapital: "Admin",
    maynotCapital: "Staff/Customer",
  };
  res.render("signup", { user: person });
});

app.get("/:user/signup", (req, res) => {
  const person = {
    may: String,
    maynot: String,
    mayCapital: String,
    maynotCapital: String,
  };
  if (req.params.user === "customer") {
    (person.may = "customer"),
      (person.maynot = "staff"),
      (person.mayCapital = "Customer"),
      (person.maynotCapital = "Staff");
  } else {
    (person.may = "staff"),
      (person.maynot = "customer"),
      (person.mayCapital = "Staff"),
      (person.maynotCapital = "Customers");
  }
  res.render("signup", { user: person });
});

app.get("/login/admin", (req, res) => {
  const person = {
    may: "admin",
    maynot: "staff/customer",
    mayCapital: "Admin",
    maynotCapital: "Staff/Customer",
  };
  res.render("login", { user: person });
});

app.get("/:user/login", (req, res) => {
  const person = {
    may: String,
    maynot: String,
    mayCapital: String,
    maynotCapital: String,
  };
  if (req.params.user === "customer") {
    (person.may = "customer"),
      (person.maynot = "staff"),
      (person.mayCapital = "Customer"),
      (person.maynotCapital = "Staff");
  } else {
    (person.may = "staff"),
      (person.maynot = "customer"),
      (person.mayCapital = "Staff"),
      (person.maynotCapital = "Customers");
  }
  res.render("login", { user: person });
});

app.get("/add-staff", (req, res) => {
  console.log(req.session);
  User.find({ role: "staff" }).then((foundUsers) => {
    if (!foundUsers) {
      console.log("no staff found");
      res.redirect("/");
    }
    console.log(foundUsers);
    Admin.findOne({ adminID: req.user.username }).then((foundAdmin) => {
      res.render("add-staff", { admin: foundAdmin, staffs: foundUsers });
    });
  });
});

app.get("/delete-staff", (req, res) => {
  Staff.find().then((foundUsers) => {
    if (!foundUsers) {
      console.log("no staff found");
      res.redirect("/");
    }
    Admin.findOne({ adminID: req.user.username }).then((foundAdmin) => {
      res.render("delete-staff", { admin: foundAdmin, staffs: foundUsers });
    });
  });
});

app.get("/add-customer", (req, res) => {
  Customer.find().then((foundUsers) => {
    if (!foundUsers) {
      console.log("no customer found");
      res.redirect("/");
    }
    Admin.findOne({ adminID: req.user.username }).then((foundAdmin) => {
      res.render("add-customer", { admin: foundAdmin, customers: foundUsers });
    });
  });
});

app.post("/signup", (req, res) => {
  const userType = req.body.userType;
  console.log(userType);
  User.register(
    { username: req.body.username },
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err);
        res.redirect("/");
      } else {
        passport.authenticate("local")(req, res, function () {
          res.render("profile_edit", { userType: userType });
        });
      }
    }
  );
});

app.post("/login", (req, res) => {
  const userType = req.body.userType;
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(user, function (err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function () {
        if (userType === "customer") {
          res.redirect("/customers/" + user.username);
        } else if (userType === "staff") {
          res.redirect("/staffs/" + user.username);
        } else {
          res.redirect("/admin/" + user.username);
        }
      });
    }
  });
});

app.post("/profile", (req, res) => {
  User.findOne({ _id: req.body.submit }).then((foundUser) => {
    if (foundUser) {
      res.render("home");
    } else {
      res.render("profile_edit", { user: foundUser });
    }
  });
});

app.post("/profile_edit", (req, res) => {
  const userType = req.body.update;
  const username = req.body.fullName;
  const useremail = req.body.email;
  const userphone = req.body.phone;
  const userdob = req.body.dob;
  const usergender = req.body.gender;
  const newStreet = req.body.street;
  const newCity = req.body.city;
  const newState = req.body.state;
  const newZip = req.body.zip;
  const useraddress = new Address({
    street: newStreet,
    city: newCity,
    state: newState,
    zipCode: newZip,
  });
  if (userType === "customer") {
    const drivingLicense = req.body.drivingLicense;
    User.findById(req.user.id)
      .then((foundUser) => {
        if (foundUser) {
          foundUser.role = "customer";
          foundUser.save();
          const newCustomer = new Customer({
            name: username,
            gender: usergender,
            dob: userdob,
            email: useremail,
            phone: userphone,
            address: useraddress,
            drivingLicense: drivingLicense,
            status: "unconfirmed",
          });
          newCustomer.save();
        }
      })
      .catch((err) => {
        console.log(err);
      });
  } else if (userType === "staff") {
    User.findById(req.user.id)
      .then((foundUser) => {
        if (foundUser) {
          foundUser.role = "staff";
          foundUser.save();
          const newStaff = new Staff({
            name: username,
            gender: usergender,
            dob: userdob,
            email: useremail,
            phone: userphone,
            address: useraddress,
            status: "unconfirmed",
          });
          newStaff.save();
        }
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    User.findById(req.user.id)
      .then((foundUser) => {
        if (foundUser) {
          foundUser.role = "admin";
          foundUser.save();
          const newAdmin = new Admin({
            adminID: req.user.username,
            name: username,
            gender: usergender,
            dob: userdob,
            email: useremail,
            phone: userphone,
            address: useraddress,
          });
          newAdmin.save().then(() => {
            res.redirect("/admin/" + req.user.username);
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

app.post("/add-staff", (req, res) => {
  const staffID = req.body.staffID;
  Staff.findOne({ username: staffID })
    .then((foundStaff) => {
      if (!foundStaff) console.log("No staff found");
      foundStaff.status = "confirmed";
      foundStaff
        .save()
        .then(() => {
          console.log("Staff status confirmed");
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post("/add-customer", (req, res) => {
  const customerID = req.body.customerID;
  Customer.findOne({ username: customerID })
    .then((foundCustomer) => {
      if (!foundCustomer) console.log("No customer found");
      foundCustomer.status = "confirmed";
      foundCustomer
        .save()
        .then(() => {
          console.log("Customer status confirmed");
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post("/add-vehicle", (req, res) => {
  const newVehicle = new Vehicle({
    category: req.body.vehicleType,
    registeration_no: req.body.regno,
    registeration_year: req.body.regnYear,
    passID: req.body.passID,
    chassis_no: req.body.chassisNumber,
    vehicle_color: req.body.vehicleColor,
  });
  newVehicle.save();
  console.log(req.session);
  User.findOne({ username: req.user.username }).then((foundUser) => {
    if (foundUser) {
      Customer.findOne({ customerID: foundUser.username }).then(
        (foundCustomer) => {
          foundCustomer.vehicle = newVehicle;
          foundCustomer
            .save()
            .then(() => {
              res.redirect("/customers/" + foundCustomer.customerID);
            })
            .catch((err) => {
              console.log(err);
            });
        }
      );
    }
  });
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
