Unregistered users:
[] View vehicles
[] Search for vehicles
[] View vehicle details
[] Book a vehicle

Registered users:
 - all from unregistered users
[] View bookings


Applicatin interaction flow:
user arrives on the home page where he sees a filter box to filter for a possible reservation. what this means, is that the use can filter for the dates when he wants to possibly rent a vehicle.
after entering this few details, the user can click on a button to search for vehicles. there he will see a list of vehicles that are available for the selected dates.


TODOs:
[]


Components:
[] search(filter) form:
    - should be on the home page in the middle of the screen when the home page is loaded
    - should have as the main input field the location of where the user wants to rent the vehicle
    - should have a button to search for the vehicles, this button should work even no filed was inputed and in that case all the searching fields are the default ones. this button will redirect to the vehicle list page.

[] location input field:
    - should be a text input field that auto-completes with the locations from the database where the vehicles can be taken from
    - if no text is inputed a dropdown menu should be shown with all the possible locations where the vehicles can be taken from

[] date input fields:
    - calendar picker
    - you cannot chose a date before today
    - pre-pick the tomorrow date as the start date
    - pre-pick the date 7 days from tomorrow as the end date
    - pre-fill the location with the location of the user

[] time input fields:
    - should have a dropdown menu to chose the time of the day when the user wants to rent the vehicle
    - the dropdown menu should have the followiing options: from every hour starting with 00:00 to 23:00 from 30 to 30 minutes
    - pre-pick the 10:00 AM as the start time
    - pre-pick the 10:00 AM as the end time

[] vehicle list(grid):
    - show a grid of vehicle cards
    - the grid should have a max of 3 columns

[] vehicle card:
    - show the vehicle image
    - show the vehicle name
    - show the vehicle price per day
    - show the vehilce motorization, fuel type, and release year
    - show a button to book the vehicle(should direct to the reservation(booking) page)

[] testimonials sections:
    - show a horizontal list of testimonials
    - is scollable by the trackpad for mobile and laptops

[x] testimonial card:
    - show the user image
    - show the user name
    - show the user rating
    - show the user review

[x] footer:

[x] header:
    - show the logo on the left
    - show the navigation menu on the right
    - show the login button on the right
    - show the signup button on the right
    - show the logout button on the right
