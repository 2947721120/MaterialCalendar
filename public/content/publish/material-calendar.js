// @license Material Calendar (v. 0.0.0.2 alpha)
!function() {
    "use stric";
    // build
    function a() {
        var a, b, c, d, j, l, m, n, o, p, q, r, s, t, u, v, w, x, y, z, A, B, C, D = this.options, E = this.messages, F = void 0 !== D.groups, G = [], H = [];
        // calendar container
        this.calendar = document.createElement("section"), this.calendar.className = "material-calendar-container " + D.className, 
        // calendar header
        a = document.createElement("header"), a.className = "material-calendar-header", 
        b = document.createElement("h2"), b.insertAdjacentHTML("beforeend", f(D.range, D.language)), 
        a.appendChild(b), this.calendar.appendChild(a), // calendar body
        c = document.createElement("section"), c.className = "material-calendar-body", // table
        d = document.createElement("table"), d.className = "calendar-table", // table thead
        j = document.createElement("thead"), m = document.createElement("tr"), // table body
        l = document.createElement("tbody"), m = document.createElement("tr"), // if calendar has groups in options
        // append a dropdown for all groups
        F && (h(j, o, p, m, E.all), A = document.createElement("tr"), n = document.createElement("th"), 
        n.className = "team", A.appendChild(n)), j.appendChild(m), l.appendChild(A || m), 
        // get months from options range and create the header
        // with the months and weeks
        v = g(D.range.start, D.range.end, D.language);
        for (w in v.formated) {
            // creates a th child for each month
            n = document.createElement("th"), n.className = "month", n.insertAdjacentHTML("beforeend", v.formated[w]), 
            // append th child in thead
            m = j.querySelector("tr"), m.appendChild(n), // append th child in tbody
            n = document.createElement("td"), n.className = "month", m = l.lastElementChild, 
            m.appendChild(n), // create a table for weeks
            x = document.createElement("table"), x.className = "weeks", A = document.createElement("thead"), 
            x.appendChild(A), n.appendChild(x), // create a tr for the week
            A = document.createElement("tr"), B = v.normal[w].split("/"), // get all weeks
            x = i(B[0], B[1], D.language, D.eventDateFormat, D.weekStart, H), s = document.createElement("td"), 
            s.className = "month", // create a table for weeks in each month
            q = document.createElement("table"), q.className = "weeks", s.appendChild(q), t = document.createElement("tr"), 
            s.querySelector(".weeks").appendChild(t);
            for (y in x) {
                for (// create an td child for each week
                B = document.createElement("td"), B.insertAdjacentHTML("beforeend", x[y]), A.appendChild(B), 
                // create an td child for each week
                t = document.createElement("td"), t.className = "week", t.setAttribute("data-week", x[y]), 
                // create a table for days
                r = document.createElement("table"), r.className = "days", B = document.createElement("tbody"), 
                r.appendChild(B), B = x[y].split("/"), C = 0; 7 > C; C++) u = document.createElement("td"), 
                u.className = "day", u.setAttribute("data-day", e(new Date(2015, Number(B[1]) - 1, Number(B[0]) + C), D.language)), 
                r.querySelector("tbody").appendChild(u);
                t.appendChild(r), s.querySelector("tr").appendChild(t);
            }
            G.push(s), n.querySelector(".weeks thead").appendChild(A);
        }
        // append a row for each group in options or just one for the main content
        z = F ? D.groups.length : 1;
        for (var I = 0; z > I; I++) for (m = document.createElement("tr"), l.appendChild(m), 
        // if has group append a th child with the group title
        F && (h(n, o, p, m, D.groups[I]), m.setAttribute("data-group", k(D.groups[I]))), 
        C = 0; C < G.length; C++) n = G[C].cloneNode(!0), m.appendChild(n);
        d.appendChild(j), d.appendChild(l), // append table to body
        c.appendChild(d), this.calendar.appendChild(c), // append doc to container set in configuration
        document.querySelector(D.container).appendChild(this.calendar);
    }
    // add events
    function b(a, b) {
        var c, d, f, g, h, i;
        b = m(b, a.eventDateFormat);
        for (var l in b) {
            if (i = e(b[l].start, a.language), b[l].end > a.range.end) throw new Error("The event's end date can't be greater than the calendar range end");
            if (b[l].start < a.range.start) throw new Error("The event's start date can't be shorter than the calendar range start");
            // if has subevents append them o event
            if (b[l].end = e(b[l].end, a.language), c = document.querySelector('[data-group="' + k(b[l].group) + '"]').querySelector('[data-day="' + i + '"]'), 
            // creates the event container
            d = document.createElement("section"), d.className = "material-calendar-event", 
            d.style.width = j(i, b[l].end, b[l].start, a.language, a.eventDateFormat), // creates the event title
            f = document.createElement("h3"), f.className = "material-calendar-title", f.setAttribute("data-title", b[l].title), 
            f.insertAdjacentHTML("beforeend", void 0 === b[l].resume ? b[l].title : b[l].resume), 
            // append title to event
            d.appendChild(f), c.appendChild(d), null !== b[l].subevents) for (var n in b[l].subevents) g = document.createElement("article"), 
            g.className = "material-calendar-card", null !== b[l].subevents[n].link ? (h = document.createElement("a"), 
            h.className = "material-calendar-title", h.setAttribute("href", b[l].subevents[n].link), 
            h.insertAdjacentHTML("beforeend", b[l].subevents[n].description), g.appendChild(h)) : (h = document.createElement("h5"), 
            h.className = "material-calendar-title", g.insertAdjacentHTML("beforeend", b[l].subevents[n].description)), 
            d.appendChild(g);
        }
    }
    // private functions
    function c(a) {
        var b = a.start.split("/"), c = a.end.split("/");
        return a.start = new Date(b[1], --b[0], 1), a.end = new Date(c[1], c[0], 0), a;
    }
    function d(a, b) {
        for (var c in b) b.hasOwnProperty(c) && (a[c] = b[c]);
        return a;
    }
    function e(a, b, c) {
        var d;
        switch (c) {
          case "MM yyyy":
            d = a.toLocaleDateString(b, {
                year: "numeric",
                month: "short"
            });
            break;

          case "MMM/yy":
            d = a.toLocaleDateString(b, {
                year: "2-digit",
                month: "short"
            });
            break;

          case "MM/yyyy":
            d = a.toLocaleDateString(b, {
                year: "numeric",
                month: "numeric"
            });
            break;

          case "dd/MM":
            d = a.toLocaleDateString(b, {
                month: "numeric",
                day: "numeric"
            });
            break;

          default:
            d = a.toLocaleDateString(b, {
                year: "numeric",
                month: "numeric",
                day: "numeric"
            });
        }
        return d;
    }
    function f(a, b) {
        var c = {
            start: 0,
            end: 0
        };
        for (var d in a) c[d] = e(a[d], b, "MM yyyy");
        return c.start + " - " + c.end;
    }
    function g(a, b, c) {
        var d = {
            formated: [],
            normal: []
        }, f = e(a, c, "MMM/yy"), g = (e(b, c, "MMM/yy"), new Date(a));
        do d.formated.push(f), d.normal.push(e(g, c, "MM/yyyy")), g = new Date(g.setMonth(g.getMonth() + 1)), 
        f = e(g, c, "MMM/yy"); while (b >= g);
        return d;
    }
    function h(a, b, c, d, e) {
        a = document.createElement("th"), a.className = "team", b = document.createElement("a"), 
        b.className = "material-calendar-link toggle-all", b.innerHTML = e, c = document.createElement("i"), 
        c.className = "material-calendar-caret-down", b.appendChild(c), a.appendChild(b), 
        d.appendChild(a);
    }
    function i(a, b, c, d, f, g) {
        var h = [], i = new Date(b, --a, 1), j = new Date(b, ++a, 0), k = Math.ceil(i.getDay() + j.getDate() / 7), l = i.getDay() || 7, m = i, n = 0, o = 0, p = 0;
        switch (f) {
          case "Sunday":
            n = 0;
            break;

          case "Monday":
            n = 1;
            break;

          case "Tuesday":
            n = 2;
            break;

          case "Wednesday":
            n = 3;
            break;

          case "Thursday":
            n = 4;
            break;

          case "Friday":
            n = 5;
            break;

          case "Saturday":
            n = 6;
        }
        m.setHours(-24 * (l - n));
        for (var q = 0; k > q; q++) {
            // if day already appears on the calendar, get next day of week (sunday, monday ..)
            for (;g.indexOf(e(m, c, "dd/MM")) >= 0; ) m.setDate(m.getDate() + 7);
            if (h.length > 1 && (o = h[h.length - 1].split("/")[1], p = m.getMonth() + 1, p > o)) break;
            h.push(e(m, c, "dd/MM")), g.push(e(m, c, "dd/MM")), m.setDate(m.getDate() + 7);
        }
        return h;
    }
    // Function that calc and return the width from the event
    // params: {
    //	start_date: the start date from the event,
    // 	end_date: 	the end date from the event,
    //  language: 	the default language from the calendar,
    //	format: 		the event date format
    // }
    function j(a, b, c, d, f) {
        // td.day that has the start date
        // while the start_date it's not equal to the end_date
        // increases one day and update the start_date
        for (var g = 0, // initial width
        h = document.querySelector("[data-day='" + a + "']"); l(a, f) <= l(b, f); ) g += h.offsetWidth, 
        a = c.setHours(24), a = e(c, d), start = document.querySelector("[data-day='" + a + "']");
        return g + "px";
    }
    // Function to remove all special characters from any string received as param
    function k(a) {
        return a = a.replace(/[ÀÁÂÃÄÅ]/, "A").replace(/[àáâãäå]/, "a").replace(/[ÈÉÊË]/, "E").replace(/[èéêë]/, "e").replace(/[ÌÍÏ]/, "I").replace(/[ìíï]/, "i").replace(/[ÒÓÕÔÖ]/, "O").replace(/[òóõôö]/, "o").replace(/[ÙÚÛÜ]/, "U").replace(/[ùúûü]/, "u").replace(/[Ç]/, "C").replace(/[ç]/, "c"), 
        a.replace(/[^a-z0-9]/gi, "").toLowerCase();
    }
    // Function that convert string to date
    // params: {
    //	date: 	the date that will be converted,
    //	format: the event date format, avaliable formats: "dd/mm/yyyy" and "mm/dd/yyyy"
    // }
    function l(a, b) {
        var c = a.split("/");
        if ("dd/mm/yyyy" === b) a = new Date(c[2], --c[1], c[0]); else {
            if ("mm/dd/yyyy" !== b) throw new Error("Not implemented format");
            a = new Date(c[2], --c[0], c[1]);
        }
        return a;
    }
    // Function to convert all dates from events array to Date using convertStringToDate
    // params: {
    //	events: the events array that will be converted,
    //	format: the event date format, avaliable formats: "dd/mm/yyyy" and "mm/dd/yyyy"
    // }
    function m(a, b) {
        for (var c in a) a[c].start = l(a[c].start, b), a[c].end = l(a[c].end, b);
        return a;
    }
    var n = performance.now();
    this.MaterialCalendar = function() {
        this.container = null, this.calendar = null, this.messages = {
            all: "todos"
        };
        // default options
        var a = {
            language: "pt-BR",
            className: "full",
            weekStart: "Monday",
            container: "body",
            eventDateFormat: "dd/MM/yyyy"
        };
        // personal options
        this.options = arguments[0] && "object" == typeof arguments[0] ? d(a, arguments[0]) : a, 
        // update range with date format options
        this.options.range = c(this.options.range), this.options.eventDateFormat = this.options.eventDateFormat.toLowerCase(), 
        this.createCalendar();
    }, MaterialCalendar.prototype.createCalendar = function() {
        a.call(this);
        var c = performance.now();
        console.log("build calendar took " + (c - n) + " milliseconds."), void 0 !== this.options.events && (n = performance.now(), 
        b(this.options, this.options.events), c = performance.now(), console.log("build calendar events took " + (c - n) + " milliseconds."));
    }, MaterialCalendar.prototype.addEvents = function(a, c) {
        var d, e, f, g, h = this;
        n = performance.now(), d = new XMLHttpRequest();
        try {
            d.open("GET", a), d.send(), e = document.createElement("div"), e.id = "material-calendar-loading", 
            f = document.createElement("div"), f.className = "material-calendar-progress", f.style.width = "25%", 
            e.appendChild(f), document.querySelector(".material-calendar-header").appendChild(e), 
            d.onreadystatechange = function() {
                g = Number.parseInt(document.querySelector(".material-calendar-progress").style.width), 
                g += 25, document.querySelector(".material-calendar-progress").style.width = g + "%", 
                4 === d.readyState && (b(h.options, JSON.parse(d.responseText)), document.querySelector("#material-calendar-loading").remove(), 
                c && c());
            };
        } catch (i) {
            throw new Error("XMLHttpRequest.open() failed.\n" + i);
        }
        perf_end = performance.now(), console.log("add events took " + (perf_end - n) + " milliseconds.");
    };
}();