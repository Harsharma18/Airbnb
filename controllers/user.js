const userModel = require("../models/user");

module.exports.signupForm = (req, res) => {
  res.render("./users/signup.ejs");
};
module.exports.postsignupForm = async (req, res) => {
  try { 
    const { username, email, password } = req.body;

    const newUser = new userModel({ username, email });
    const registeredUser = await userModel.register(newUser, password);
    console.log(registeredUser);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to Airbnb");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("./users/signup.ejs");
  }
};
module.exports.loginForm = (req, res) => {
  res.render("./users/login.ejs");
};
module.exports.postloginForm = async (req, res) => {
  req.flash("success", "Welcome to Airbnb");
  let returnUrl = res.locals.redirectUrl || "/listings";
  res.redirect(returnUrl);
};
module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are logged out now");
    res.redirect("/listings");
  });
};
module.exports.renderImageChangeForm = async (req, res, next) => {
  let { id } = req.params;
  let user = await userModel.findById(id);
  res.render("./users/changeImage.ejs", { user });
};module.exports.updateImage = async (req, res, next) => {
  try {
      const { id } = req.params;

      if (!req.file) {
          req.flash('error', 'No file uploaded. Please try again.');
          return res.redirect('/profile');
      }

      const url = req.file.path;
      const filename = req.file.filename;

      const user = await userModel.findById(id);
      if (!user) { 
          req.flash('error', 'User not found');
          return res.redirect('/profile');
      }

      user.image = { url, filename };
      await user.save();

      req.flash('success', 'Your account image has been successfully updated.');
      res.redirect('/profile');
  } catch (e) {
      next(e);
  }
};
module.exports.deleteImage = async (req, res, next) => {
  try {
      const { id } = req.params;

      const user = await userModel.findById(id);
      if (!user) {
          req.flash("error", "User not found");
          return res.redirect("/profile");
      }

      // Set the default preview image
      user.image = { 
        url: "/icons/userpreview.png",  // Default profile image
        filename: "user-image" // Default filename
      };
      
      await user.save();

      req.flash("success", "Profile image deleted. Default image set.");
      res.redirect("/profile");
  } catch (e) {
      next(e);
  }
};
