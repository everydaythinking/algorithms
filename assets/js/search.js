(function() {
  function displaySearchResults(results, store) {
    var searchResults = document.getElementById('search-results');

    if (results.length) { // Are there any results?
      var appendString = '';

      for (var i = 0; i < results.length; i++) {
        var splitLen = results[i].ref.split('-').length;
        for (j = 0; j < splitLen; j++) {
          results[i].ref = results[i].ref.replace('-', '%');
        }

        var updateRef = "";
        var len = results[i].ref.split('%').length;
        for (j = 0; j < len; j++) {
          var tmp = results[i].ref.split('%')[j];
          if (tmp.length < 3) {
            if (Number(tmp) <= 63) {
              updateRef = updateRef + tmp;
            } else {
              updateRef = updateRef + '%' + tmp.substring(0, 2);
            }
          } else {
            updateRef = updateRef + tmp;
          }
        }
        updateRef = updateRef.toUpperCase(updateRef);
        updateRef = "http://jkryu219.github.io/search/?query=%5B" + updateRef
        console.log(updateRef);
        results[i].ref = decodeURI(updateRef).split('=')[1]
      }

      results.sort(
        function(a, b) {
          return (Number(a.ref.match(/(\d+)/g)[0]) - Number(b.ref.match(/(\d+)/g)[0]));
        })

      for (var i = 0; i < results.length; i++) {
        results[i].ref = encodeURI(results[i].ref)
        results[i].ref = results[i].ref.substring(4)
        results[i].ref = results[i].ref.toLowerCase(results[i].ref)
        var tokenLen = results[i].ref.split('%').length
        for (var j = 0; j < tokenLen; j++) {
          results[i].ref = results[i].ref.replace('%', '-')
        }
        var hyphenLen = results[i].ref.split('-').length
        var token = ""
        var updateRef = ""
        for (var j = 0; j < hyphenLen; j++) {
          results[i].ref.split('-')[j]
          if (results[i].ref.split('-')[j].length >= 3) {
            results[i].ref.split('-')[j] = results[i].ref.split('-')[j].substring(0, 2) + '-' + results[i].ref.split('-')[j].substring(2)
          }
          if (j != hyphenLen - 1) {
            updateRef = updateRef + token + '-'
          } else {
            updateRef = updateRef + token
          }
        }
        results[i].ref = updateRef;
      }

      for (var i = 0; i < results.length; i++) { // Iterate over the results
        console.log(results[i]);
        var item = store[results[i].ref];
        appendString += '<ul><li class="wow fadeInLeft" data-wow-duration="1.5s" style="visibility: visible; animation-duration: 1.5s; animation-name: fadeInLeft;"><a class="zoombtn" href="' + item.url + '">' + item.title + '</a><p>' + item.excerpt + '</p><a class="btn zoombtn" href="' + item.url + '">Read More</a></li></ul>';
      }

      searchResults.innerHTML = appendString;
    } else {
      searchResults.innerHTML = '<ul><li><a class="zoombtn" href="javascript:void(0);">No results found</li></ul>';
    }
  }

  function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');

    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');

      if (pair[0] === variable) {
        return decodeURIComponent(pair[1].replace(/\+/g, '%20'));
      }
    }
  }

  var searchTerm = getQueryVariable('query');

  if (searchTerm) {
    document.getElementById('search-box').setAttribute("value", searchTerm);

    // Initalize lunr with the fields it will be searching on. I've given title
    // a boost of 10 to indicate matches on this field are more important.
    var idx = lunr(function() {
      this.field('id');
      this.field('title', {
        boost: 10
      });
      this.field('category');
    });

    for (var key in window.store) { // Add the data to lunr
      idx.add({
        'id': key,
        'title': window.store[key].title,
        'category': window.store[key].category,
      });

      var results = idx.search(searchTerm); // Get lunr to perform a search
      displaySearchResults(results, window.store); // We'll write this in the next section
    }
  }
})();
