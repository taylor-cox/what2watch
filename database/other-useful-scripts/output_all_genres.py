import csv

with open('./title_basics_genres.csv') as f:
    reader = csv.reader(f)
    genres = list(reader)

genres_set = set()

for genre_list in genres[1:100]:
    for genre in genre_list[0].split(','):
        genres_set.add(genre)

print(genres_set)