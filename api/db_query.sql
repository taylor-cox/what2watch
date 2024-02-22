select tb."index",
  tb.tconst,
  tb."titleType",
  tb."primaryTitle",
  tb."originalTitle",
  tb."isAdult",
  tb."startYear",
  tb."endYear",
  tb."runtimeMinutes",
  tb.genres,
  tr."averageRating"
from title_basics tb
  inner join title_ratings tr on tr.tconst = tb.tconst
  inner join title_principals tp on tb.tconst = tp.tconst
  inner join name_basics nb on nb.nconst = tp.nconst
where tb.genres like '%' || $1 || '%'
  and nb."primaryName" like '%' || $2 || '%'
  and (
    nb."primaryProfession" like '%actor%'
    or nb."primaryProfession" like '%actress%'
  )
  and tb."titleType" like '%' || $3 || '%'
  and tr."averageRating"::DECIMAL > $4::DECIMAL
  and tb."isAdult" like '%' || $5 || '%'
  and tb."runtimeMinutes"::numeric > $6::numeric
  and tb."startYear"::numeric > $7::numeric
order by random()
limit 10;