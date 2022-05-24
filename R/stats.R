
#' Outlier exclusion using modified recursive procedure
#'
#' @description Reproduces the modified recursive outlier exclusion procedure for reaction times from Van Selst, M., & Jolicoeur, P. (1994). A solution to the effect of sample size on outlier elimination. The Quarterly Journal of Experimental Psychology Section A, 47(3), 631-650.
#'
#' @param rts a vector of reaction times
#'
#' @return list containing original rts, restricted rts with outlier removed, and proportion removed
#' @export
#'
#' @examples
#' modified_recursive_moving(c(500,501,502,503,600))
modified_recursive_moving <- function(rts){

  # define cell sizes
  xsize <- c(4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 20,
             25, 30, 35, 50, 100)

  # define std cut offs per cell-size
  stds <- c(8.00, 6.2, 5.3, 4.8, 4.475, 4.25, 4.11,
            4.00, 3.92, 3.85, 3.80, 3.75, 3.64, 3.595, 3.55,
            3.54, 3.51, 3.5)

  restricted_rts <- rts

  stop <- FALSE

  while(stop==FALSE){

    if( length(restricted_rts >= 100) ){
      sdc <- 3.5
    }else{
      sdc <- approx(xsize,stds,xout=length(restricted_rts))$y
    }

    temporary_exclusion <- max(restricted_rts)
    descriptives <- c(mean(restricted_rts[restricted_rts<temporary_exclusion]),
                      sd(restricted_rts[restricted_rts<temporary_exclusion]))
    lower_cutoff <- descriptives[1]-(descriptives[2]*sdc)
    upper_cutoff <- descriptives[1]+(descriptives[2]*sdc)
    retained_rts <- restricted_rts

    if(min(restricted_rts) < lower_cutoff){
      retained_rts<-restricted_rts[restricted_rts>min(restricted_rts)]
    }
    if(max(restricted_rts) > upper_cutoff){
      retained_rts<-restricted_rts[restricted_rts<max(restricted_rts)]
    }

    #check for breaking loop
    if( length(retained_rts) == length(restricted_rts) ){
      stop <- TRUE
      restricted_rts <-retained_rts
    } else if ( length(restricted_rts) < 4 ){
      stop <- TRUE
      restricted_rts <- retained_rts
    } else {
      restricted_rts <- retained_rts
    }
  }

  return(list(original_rts=rts,
              restricted=restricted_rts,
              prop_removed=(1-(length(restricted_rts)/length(rts)))
              )
         )

}


#' Outlier exclusion using non-recursive procedure
#'
#' @description Reproduces the non-recursive outlier exclusion procedure for reaction times from Van Selst, M., & Jolicoeur, P. (1994). A solution to the effect of sample size on outlier elimination. The Quarterly Journal of Experimental Psychology Section A, 47(3), 631-650.
#'
#' @param rts a vector of reaction times
#'
#' @return list containing original rts, restricted rts with outlier removed, and proportion removed
#' @export
#'
#' @examples
#' modified_recursive_moving(c(500,501,502,503,600))
non_recursive_moving<-function(rts){

  # cell sizes
  xsize <- c(4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 20,
             25, 30, 35, 50, 100)

  # std cut offs per cell cize
  stds <- c(1.458, 1.68, 1.841, 1.961, 2.05, 2.12, 2.173,
            2.22, 2.246, 2.274, 2.31, 2.326, 2.391, 2.41, 2.4305,
            2.45, 2.48, 2.5)

  if( length(rts >= 100) ){
    sdc <- 2.5
  } else {
    sdc <- approx(xsize,stds,xout=length(rts))$y
  }

  mean_rts <- mean(rts)
  restricted_rts <- rts[rts > mean_rts - (sd(rts)*sdc) &
                        rts < mean_rts + (sd(rts)*sdc)]

  list(original_rts=rts,
       restricted=restricted_rts,
       prop_removed=(1-(length(restricted_rts)/length(rts))))
}

#' Standard error of the mean
#'
#' @param x vector numeric
#'
#' @return numeric, standard error of the mean
#' @export
#'
#' @examples
#' sem(c(1,2,3,4,5))
sem <- function(x) {
  sd(x)/sqrt(length(x))
}
