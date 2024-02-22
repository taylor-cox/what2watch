// Valid options for movie posters.
const movie_posters = [
  "captain-phillips.jpg",
  "cowboys-and-aliens.jpg",
  "gladiator.jpg",
  "goodfellas.jpg",
  "pulp-fiction.jpg",
  "shawshank-redemption.jpg",
  "silence-of-the-lambs.jpg",
  "the-exporcist.jpg",
  "titanic.jpeg",
  "top-gun.jpeg",
];

// Random neon colors.
const neon_colors = [
  "#4deeea",
  "#74ee15",
  "#ffe700",
  "#f000ff",
  "#001eff",
  "#af3dff",
  "#55ffe1",
  "#ff3b94",
  "#a6fd29",
  "#37013a",
  "#00aaff",
  "#aa00ff",
  "#ff00aa",
  "#ffaa00",
  "#aaff00",
];

// All the genres.
const genres = [
  "Any",
  "Family",
  "Biography",
  "Game-Show",
  "Crime",
  "Sci-Fi",
  "Horror",
  "Adult",
  "Music",
  "Reality-TV",
  "Documentary",
  "Western",
  "Thriller",
  "History",
  "Adventure",
  "Action",
  "Animation",
  "News",
  "Mystery",
  "Comedy",
  "Fantasy",
  "Musical",
  "Drama",
  "Short",
  "Romance",
  "War",
  "Sport",
];

// All the types.
const types = [
  "Any",
  "Movie",
  "Short",
  "TV Episode",
  "TV Mini-Series",
  "TV Movie",
  "TV Pilot",
  "TV Series",
  "TV Short",
  "TV Special",
  "Video",
  "Video Game",
];

function main() {
  // Make the text interesting.
  new CircleType(document.getElementById("slot-top-text")).radius(800);

  // Add random movie posters to the slots.
  addSlotImages();

  // Add random colors for the slot sides paragraphs.
  randomSlotSideColors();
  setInterval(randomSlotSideColors, 300);

  // Add options to the dropdowns.
  addDropdownOptions();

  // Add functionality to the slot pulley.
  pullTheLeverCronk();

  // Draw the background.
  drawStars();
}

// Adds functionality to the slot pulley.
function pullTheLeverCronk() {
  $("#slot-pulley").on("click", function () {
    // Check if the pulley is disabled.
    if ($("#slot-pulley").attr("disabled")) return;

    // Disable the pulley.
    $("#slot-pulley").attr("disabled", true);

    // Rotate the pulley to +30 degrees
    $("#slot-pulley").css("transform", "rotate(30deg)");

    column_spin_intervals = [];

    setTimeout(function () {
      column_spin_intervals.push(spinColumn($(".slot-col")[0]));
    }, 0);

    setTimeout(function () {
      column_spin_intervals.push(spinColumn($(".slot-col")[1]));
    }, 350);

    setTimeout(function () {
      column_spin_intervals.push(spinColumn($(".slot-col")[2]));
    }, 700);
      
    function openDialog(movie) {
      // Stop the spinners.
      column_spin_intervals.forEach((interval) => {
        clearInterval(interval);
      });

      // Reset the functionality for the slot pulley.
      $("#slot-pulley").hover(
        () => { 
          if ($("#slot-pulley").attr("disabled")) return;
          $("#slot-pulley").css("transform", "rotate(-25deg)"); 
        },
        () => { 
          if ($("#slot-pulley").attr("disabled")) return;
          $("#slot-pulley").css("transform", "rotate(-30deg)"); 
        }
      );
      $("#slot-pulley").css("transform", "rotate(-30deg)");
      $("#slot-pulley").css("transition", "transform 0.5s");

      // Reset the spinner positions.
      $(".slot-col").css("transform", "translateY(0px)");

      // Add the text to the dialog.
      $('#dialog-movie-title > span').text(movie.primaryTitle);
      $('#dialog-movie-genres > span').text(movie.genres);
      $('#dialog-movie-type > span').text(movie.titleType);
      $('#dialog-movie-release-year > span').text(movie.startYear);
      $('#dialog-movie-runtime > span').text(movie.runtimeMinutes);
      $('#dialog-movie-rating > span').text(movie.rating);

      // Open the dialog.
      $("#dialog").attr("open", true);
      $("#dialog").css("display", "flex");
      $("#close-dialog").on("click", function () {
        $("#dialog").attr("open", false);
        $("#dialog").css("display", "none");
        $("#slot-pulley").attr("disabled", false);
      });
    }

    // Body of the request.
    let body = {
      genre: $("#search-genre").val() == 'Any' ? '' : $("#search-genre").val(),
      type: $("#search-type").val() == 'Any' ? '' : $("#search-type").val(),
      start_year: $("#search-start-year").val(),
      runtime: $("#search-runtime").val(),
      rating: $("#search-rating").val(),
      featuring: $("#search-featuring").val(),
      is_adult: $("#search-adult").is(":checked") ? '1' : '0',
    }
    // Open the dialog after getting the data from the db.
    fetch("http://localhost:3000/movies", data = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      openDialog(data[Math.random() * data.length | 0]);
    })
    .catch(error => {
      console.error('Error:', error)
    });
    // setTimeout(openDialog, 1000);
  });
}

// It spins the columns.
function spinColumn(column) {
  // Translate the column down continuously.
  var column_height = column.clientHeight;
  var current_translate = 0;
  var translate_speed = 0;
  return setInterval(function () {
    current_translate += translate_speed;
    column.style.transform = "translateY(" + current_translate + "px)";
    if (current_translate >= column_height / 5) {
      // clearInterval(translate_interval);
      // Remove the last element from the column, and put it at the top.
      var last_element = column.lastElementChild;
      column.removeChild(last_element);
      column.insertBefore(last_element, column.firstElementChild);
      column.style.transform = "translateY(0px)";
      current_translate = 0;
    }
    
    if (translate_speed < 10) translate_speed += 0.1;

  }, 10);
}

// Adds options to the dropdowns.
function addDropdownOptions() {
  // Add options to the genre dropdown.
  for (var i = 0; i < genres.length; i++) {
    let new_option =
      '<option value="' + genres[i] + '">' + genres[i] + "</option>";
    $("#search-genre").append(new_option);
  }

  // Add options to the type dropdown.
  for (var i = 0; i < types.length; i++) {
    let new_option =
      '<option value="' + types[i] + '">' + types[i] + "</option>";
    $("#search-type").append(new_option);
  }
}

// Adds random neon colors to the slot sides.
function randomSlotSideColors() {
  var sides = $(".slot-side > *");
  for (var i = 0; i < sides.length; i++) {
    sides[i].style.color =
      neon_colors[Math.floor(Math.random() * neon_colors.length)];
    sides[i].style.textShadow =
      "0 0 10px " + neon_colors[Math.floor(Math.random() * neon_colors.length)];
  }
}

// Adds random movie posters to the slots.
function addSlotImages() {
  // // Get the slots.
  // var slots = $('.slot');
  var slots = $(".slot");

  for (var i = 0; i < slots.length; i++) {
    slots[i].style.backgroundImage =
      "url('img/movie-posters/" +
      movie_posters[Math.floor(Math.random() * movie_posters.length)] +
      "')";
  }
}

// Draw canvas hollywood hills. #artsy
function drawStars() {
  // Get the HTML canvas.
  var canvas = document.getElementById("hollywood-hills");
  var ctx = canvas.getContext("2d");

  // Set the canvas size to it's current size according to css.
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  // Make the background black
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw the stars.
  for (var i = 0; i < 100; i++) {
    var x = Math.random() * canvas.width;
    var y = Math.random() * canvas.height;
    drawStar(x, y, 5, 1, 3, ctx);
  }
}

// I stole this from:
// https://stackoverflow.com/questions/25837158/how-to-draw-a-star-by-using-canvas-html5
// I don't know how it works and don't want to figure it out. Sue me.
function drawStar(cx, cy, spikes, outerRadius, innerRadius, ctx) {
  var rot = (Math.PI / 2) * (Math.random() + 2);
  var x = cx;
  var y = cy;
  var step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "yellow";
  ctx.stroke();
  ctx.fillStyle = "yellow";
  ctx.fill();
}

document.onload = main();
