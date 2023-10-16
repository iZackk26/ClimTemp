package main

import (
	"context"
	"encoding/json"
	"net/http"

	firebase "firebase.google.com/go"
	_ "firebase.google.com/go/auth"
	"firebase.google.com/go/db"

	"google.golang.org/api/option"
)

var (
	ref *db.Ref
)

type TemperatureRecord struct {
	Celcius    int `json:"celcius"`
	Fahrenheit int `json:"farenheit"`
}

type Data map[string]map[string]TemperatureRecord

func init() {
	opt := option.WithCredentialsFile("keys.json")
	app, err := firebase.NewApp(context.Background(), nil, opt)
	if err != nil {
		panic(err)
	}
	database, err := app.DatabaseWithURL(context.Background(), "https://weathermonitordb-default-rtdb.firebaseio.com/")
	if err != nil {
		panic(err)
	}
	ref = database.NewRef("Temperature")

}

// fmt.Println(string(dataJson))
func main() {
	// Create a simple file server
   	http.Handle("/", http.FileServer(http.Dir("./public")))
	http.HandleFunc("/temperatures", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		var data Data
		if err := ref.Get(r.Context(), &data); err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		date := r.URL.Query().Get("date")
		if date != "" {
			got, ok := data[date]
			if !ok {
				w.WriteHeader(http.StatusNotFound)
				return
			}
			dataJson, err := json.Marshal(got)
			if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			w.Write(dataJson)
		} else {
			dataJson, err := json.Marshal(data)
			if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			w.Write(dataJson)
		}
	})
    err := http.ListenAndServe(":8080", nil)
    if err != nil {
        panic(err)
    }

}
