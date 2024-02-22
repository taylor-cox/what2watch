package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/guregu/null/v5"
	"github.com/julienschmidt/httprouter"
	_ "github.com/lib/pq"
	"github.com/rs/cors"
)

type PostRequestBody struct {
	Genre     null.String `json:"genre"`
	Type      null.String `json:"type"`
	StartYear null.String `json:"start_year"`
	Runtime   null.String `json:"runtime"`
	Rating    null.String `json:"rating"`
	Featuring null.String `json:"featuring"`
	IsAdult   null.String `json:"is_adult"`
}

// Do I really have to capitalize everything to make it public?
type TitleBasics struct {
	Index          int64       `json:"index"`
	Tconst         null.String `json:"tconst"`
	TitleType      null.String `json:"titleType"`
	PrimaryTitle   null.String `json:"primaryTitle"`
	OriginalTitle  null.String `json:"originalTitle"`
	IsAdult        null.String `json:"isAdult"`
	StartYear      null.String `json:"startYear"`
	EndYear        null.String `json:"endYear"`
	RuntimeMinutes null.String `json:"runtimeMinutes"`
	Genres         null.String `json:"genres"`
	Rating				 null.String `json:"rating"`
}

func QueryMovies(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	// Open the postgres connection.
	connStr := "postgres://postgres:password@database:5432/postgres?sslmode=disable"
	db, err := sql.Open("postgres", connStr)

	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// I love how Go errors if I don't use the variable.
	// Ya know, as opposed to just giving a warning or something.

	// Get the request body.
	post_req_body := PostRequestBody{}
	dec := json.NewDecoder(r.Body)
	err = dec.Decode(&post_req_body)
	if err != nil {
		fmt.Fprintf(w, "Error decoding JSON: %v", err)
	}

	// Read the SQL query from a file.
	query, err := os.ReadFile("db_query.sql")
	if err != nil {
		fmt.Fprintf(w, "Error reading SQL file: %v", err)
	}

	// Query the database.
	var title_basics []TitleBasics
	// This is a fun query. It'll take forever.
	
	// Get the numeric values from the request body.
	rating, err := strconv.ParseFloat(post_req_body.Rating.String, 64)
	if err != nil {
		rating = 0.0
	}

	runtime, err := strconv.ParseInt(post_req_body.Runtime.String, 10, 64)
	if err != nil {
		runtime = 0
	}

	start_year, err := strconv.ParseInt(post_req_body.StartYear.String, 10, 64)
	if err != nil {
		start_year = 0
	}

	rows, err := db.Query(string(query),
		post_req_body.Genre,
		post_req_body.Featuring,
		post_req_body.Type,
		rating, 
		post_req_body.IsAdult,
		runtime,
		start_year,
	);
	if err != nil {
		log.Fatal(err)
	}

	// Put the results into an array of structs.
	for rows.Next() {
		var title_basic TitleBasics
		// Look at how pretty go is.
		if err := rows.Scan(
			&title_basic.Index,
			&title_basic.Tconst,
			&title_basic.TitleType,
			&title_basic.PrimaryTitle,
			&title_basic.OriginalTitle,
			&title_basic.IsAdult,
			&title_basic.StartYear,
			&title_basic.EndYear,
			&title_basic.RuntimeMinutes,
			&title_basic.Genres,
			&title_basic.Rating); err != nil {
			fmt.Fprintf(w, "Error scanning row: %v", err)
		}
		title_basics = append(title_basics, title_basic)
	}

	// Check for errors after we're done iterating over the rows.
	if err := rows.Err(); err != nil {
		fmt.Fprintf(w, "Error scanning row: %v", err)
	}

	// Marshal the results into JSON.
	b, err := json.Marshal(title_basics)
	if err != nil {
		fmt.Fprintf(w, "Error marshalling JSON: %v", err)
	}

	fmt.Fprintf(w, string(b))
}

func main() {
	router := httprouter.New()
	router.POST("/movies", QueryMovies)

	// CORS
	// router.GlobalOPTIONS = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
	// 	if r.Header.Get("Access-Control-Request-Method") != "" {
	// 		// Set CORS headers
	// 		header := w.Header()
	// 		header.Set("Access-Control-Allow-Methods", header.Post("Allow"))
	// 		header.Set("Access-Control-Allow-Origin", "*")
	// 	}

	// 	// Adjust status code to 204
	// 	w.WriteHeader(http.StatusNoContent)
	// })


	handler := cors.Default().Handler(router)

	fmt.Println("Server is running on port 3000")
	log.Fatal(http.ListenAndServe(":3000", handler))
}
