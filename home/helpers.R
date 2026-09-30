# Helpers for the home page (index.qmd).
# They read the same .bib files as Publications.qmd, so the front page
# updates whenever the publication lists do.

read_pubs <- function() {
  cols <- c("BIBTEXKEY", "CATEGORY", "TITLE", "AUTHOR", "DATE",
            "JOURNALTITLE", "JOURNAL", "BOOKTITLE", "PUBLISHER", "DOI", "URL")
  read_one <- function(path, status) {
    df <- suppressWarnings(suppressMessages(bib2df::bib2df(path)))
    for (col in setdiff(cols, names(df))) df[[col]] <- NA
    df <- df[, cols]
    df$status <- status
    df
  }
  pubs <- rbind(
    read_one("publications/Crump_In_progress/Crump_In_progress.bib", "forthcoming"),
    read_one("publications/Crump/Crump.bib", "published")
  )
  pubs$TITLE <- gsub("[{}]", "", pubs$TITLE)
  pubs$year <- substr(pubs$DATE, 1, 4)
  pubs[order(pubs$DATE, decreasing = TRUE), ]
}

# "Jamieson & Crump", "Johns, Jamieson, Crump & Jones", or "Behmer et al."
short_authors <- function(authors) {
  authors <- trimws(authors)
  # Handles both "Last, First" and "First Last".
  last <- ifelse(grepl(",", authors), sub(",.*$", "", authors), sub("^.*\\s", "", authors))
  last <- ifelse(last == "Crump", "<strong>Crump</strong>", last)
  n <- length(last)
  if (n == 1) return(last)
  if (n > 4) return(paste0(last[1], " et al."))
  paste0(paste(last[-n], collapse = ", "), " &amp; ", last[n])
}

venue <- function(row) {
  v <- c(row$JOURNALTITLE, row$JOURNAL, row$BOOKTITLE, row$PUBLISHER)
  v <- v[!is.na(v)]
  if (length(v)) return(gsub("[{}]", "", v[1]))
  if (identical(tolower(row$CATEGORY), "book")) "Book" else ""
}

pub_link <- function(row) {
  if (!is.na(row$DOI)) return(paste0("https://doi.org/", row$DOI))
  if (!is.na(row$URL)) return(row$URL)
  "Publications.qmd"
}

# Prints an HTML list of the n most recent publications. Each part has its own
# class so every front-page option can style it differently.
recent_pubs <- function(n = 5) {
  pubs <- head(read_pubs(), n)
  items <- vapply(seq_len(nrow(pubs)), function(i) {
    row <- pubs[i, ]
    sprintf(paste0(
      '<li class="pub">',
      '<span class="pub-year">%s</span>',
      '<span class="pub-body">',
      '<a class="pub-title" href="%s">%s</a>',
      '<span class="pub-meta"><span class="pub-authors">%s</span>',
      '<span class="pub-venue">%s</span>%s</span>',
      '</span></li>'),
      row$year, pub_link(row), row$TITLE, short_authors(row$AUTHOR[[1]]),
      venue(row),
      if (row$status == "forthcoming") '<span class="pub-status">forthcoming</span>' else "")
  }, character(1))
  cat('<ol class="pub-list">', items, '</ol>', sep = "\n")
}

pub_count <- function() nrow(read_pubs())

post_count <- function() {
  posts <- list.files("blog", pattern = "^index\\.qmd$", recursive = TRUE)
  posts <- posts[!grepl("^drafts/", posts)]
  drafts <- vapply(file.path("blog", posts), function(f) {
    any(grepl("^draft:\\s*true", readLines(f, n = 30, warn = FALSE)))
  }, logical(1))
  sum(!drafts)
}
