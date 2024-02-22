# import polars as pl
import traceback
import pandas as pd
import psycopg
from sqlalchemy import create_engine
from collections import defaultdict

if __name__ == '__main__':
  # Get the data from the TSV file(s)
  paths = [
    # Columns: nconst primaryName birthYear deathYear primaryProfession knownForTitles
    ("imdb-data/name.basics.tsv", ['nconst', 'primaryName', 'birthYear', 'deathYear', 'primaryProfession', 'knownForTitles']),

    # Columns: titleId ordering title region language types attributes isOriginalTitle
    ("imdb-data/title.akas.tsv", ["titleId", "ordering", "title", "region", "language", "types", "attributes", "isOriginalTitle"]),

    # Columns: tconst titleType primaryTitle originalTitle isAdult startYear endYear runtimeMinutes genres
    ("imdb-data/title.basics.tsv", ["tconst", "titleType", "primaryTitle", "originalTitle", "isAdult", "startYear", "endYear", "runtimeMinutes", "genres"]), 

    # Columns: tconst directors writers
    ("imdb-data/title.crew.tsv", ["tconst", "directors", "writers"]), 

    # Columns: tconst parentTconst seasonNumber episodeNumber
    ("imdb-data/title.episode.tsv", ["tconst", "parentTconst", "seasonNumber", "episodeNumber"]),

    # Columns: tconst ordering nconst category job characters
    ("imdb-data/title.principals.tsv", ["tconst", "ordering", "nconst", "category", "job", "characters"]),

    # Columns: tconst averageRating numVotes
    ("imdb-data/title.ratings.tsv", ["tconst", "averageRating", "numVotes"])
  ]

  # This is for memory management. Change the number to the number of lines you want to skip.
  skip_rows = 0
  lines_to_add = 1_000_000

  for path in paths:
    print(f'Processing {path[0]}...')
    print(f'Columns: {path[1]}')
    while True:
      try:
        # Read the data from the TSV file.
        # If this errors, then we need to decrease the number of lines to add.
        types = defaultdict(lambda: 'string', A='string')
        df: pd.DataFrame = pd.read_csv(
          path[0],
          sep='\t',
          low_memory=True,
          skiprows=skip_rows,
          nrows=lines_to_add,
          na_values=["\\N"],
          names=path[1],
          header=0,
          on_bad_lines='skip',
          dtype=types
        )

        if df.empty:
          raise Exception('empty CSV')
        
        # Connect to the database
        engine = create_engine("postgresql://postgres:password@localhost")

        # Write the data to the database.
        df.to_sql(
          path[0].split('/')[1].split('.')[0] + "_" + path[0].split('/')[1].split('.')[1],
          con=engine,
          if_exists="append",
        )
        print(f'Added lines {skip_rows} to {skip_rows + lines_to_add} to {path[0].split("/")[1].split(".")[0] + "_" + path[0].split("/")[1].split(".")[1]}')

        # If the number of lines to add is less than 1_000_000, then we are done with this file.
        skip_rows += lines_to_add
        if lines_to_add < 1_000_000:
          print('Moving to next file...')
          print(lines_to_add)
          break
      except Exception as e:
        # traceback.print_exception(type(e), e, e.__traceback__)
        if str(e) == 'empty CSV':
          print('Moving to next file...')
          break
        else:
          traceback.print_exception(type(e), e, e.__traceback__)
          exit()
    
    skip_rows = 0
    lines_to_add = 1_000_000

    
