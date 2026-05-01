const existingBookings =
  JSON.parse(localStorage.getItem("myBookings")) || [];

localStorage.setItem(
  "myBookings",
  JSON.stringify([...existingBookings, bookingData])
);
