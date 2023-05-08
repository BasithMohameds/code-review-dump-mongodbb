exports.catchAsync = (myFunc) => (req, res, next) => {
  Promise.resolve(myFunc(req, res, next))
    .then(({ message = "error", status = false }) => {
      if (status) return res.status(200).json({ message, status });
      else return res.status(400).json({ message, status });
    })
    .catch((err) => {
      return res
        .status(400)
        .json({ message: err?.message ?? "Error occurred.", status: false });
    });
};
