// @license Material Calendar (v. 0.0.1.3 beta)
!function(a) {
    "use strict";
    function b() {
        this.calendar = null, this.messages = {
            all: "todos"
        };
        // default options
        var a = {
            language: "pt-BR",
            className: "full",
            container: "body",
            eventDateFormat: "dd/MM/yyyy"
        };
        // personal options
        this.options = arguments[0] && "object" == typeof arguments[0] ? f(a, arguments[0]) : a, 
        // update range with date format options
        this.options.range = e(this.options.range), this.options.eventDateFormat = this.options.eventDateFormat.toLowerCase(), 
        this.options.groups = this.options.groups.sort(function(a, b) {
            return b > a;
        }), this.createCalendar();
    }
    // build
    function c(a) {
        var b, c, d, e, f, l, n, o, p, q, r, s, t, u, v, w, x, y, z, A, B, C, D, E, F = a.options, G = a.messages, H = void 0 !== F.groups, I = [], J = [];
        // calendar container
        a.calendar = document.createElement("section"), a.calendar.className = "material-calendar-container " + F.className, 
        // calendar header
        b = document.createElement("header"), b.className = "material-calendar-header", 
        c = document.createElement("h2"), c.insertAdjacentHTML("beforeend", h(F.range, F.language)), 
        b.appendChild(c), a.calendar.appendChild(b), // calendar body
        d = document.createElement("section"), d.className = "material-calendar-body", // table
        e = document.createElement("table"), e.className = "calendar-table", // table thead
        f = document.createElement("thead"), n = document.createElement("tr"), // table body
        l = document.createElement("tbody"), n = document.createElement("tr"), // if calendar has groups in options
        // append a dropdown for all groups
        H && (j(f, p, q, n, G.all), B = document.createElement("tr"), o = document.createElement("th"), 
        o.className = "team", B.appendChild(o)), f.appendChild(n), l.appendChild(B || n), 
        // get months from options range and create the header
        // with the months and weeks
        w = i(F.range.start, F.range.end, F.language);
        for (x in w.formated) {
            // creates a th child for each month
            o = document.createElement("th"), o.className = "month", o.insertAdjacentHTML("beforeend", w.formated[x]), 
            // append th child in thead
            n = f.querySelector("tr"), n.appendChild(o), // append th child in tbody
            o = document.createElement("td"), o.className = "month", n = l.lastElementChild, 
            n.appendChild(o), // create a table for weeks
            y = document.createElement("table"), y.className = "weeks", B = document.createElement("thead"), 
            y.appendChild(B), o.appendChild(y), // create a tr for the week
            B = document.createElement("tr"), C = w.normal[x].split("/"), // get all weeks
            y = k(C[0], C[1], F.language, F.eventDateFormat, J), t = document.createElement("td"), 
            t.className = "month", // create a table for weeks in each month
            r = document.createElement("table"), r.className = "weeks", t.appendChild(r), u = document.createElement("tr"), 
            t.querySelector(".weeks").appendChild(u);
            for (z in y.formated) {
                for (// create an td child for each week
                C = document.createElement("td"), C.className = "week", C.insertAdjacentHTML("beforeend", y.formated[z]), 
                B.appendChild(C), // create an td child for each week
                u = document.createElement("td"), u.className = "week", u.setAttribute("data-week", y.formated[z]), 
                // create a table for days
                s = document.createElement("table"), s.className = "days", C = document.createElement("tbody"), 
                s.appendChild(C), C = y.normal[z].split("/"), D = 0; 7 > D; D++) v = document.createElement("td"), 
                v.className = "day", v.setAttribute("data-day", g(new Date(Number(C[2]), Number(C[1]) - 1, Number(C[0]) + D), F.language)), 
                s.querySelector("tbody").appendChild(v);
                u.appendChild(s), t.querySelector("tr").appendChild(u);
            }
            I.push(t), o.querySelector(".weeks thead").appendChild(B);
        }
        for (// append a row for each group in options or just one for the main content
        A = H ? F.groups.length : 1, E = 0; A > E; E++) for (n = document.createElement("tr"), 
        l.appendChild(n), // if has group append a th child with the group title
        H && (j(o, p, q, n, F.groups[E]), n.setAttribute("data-group", m(F.groups[E]))), 
        D = 0; D < I.length; D++) o = I[D].cloneNode(!0), n.appendChild(o);
        e.appendChild(f), e.appendChild(l), // append table to body
        d.appendChild(e), a.calendar.appendChild(d), // append doc to container set in configuration
        document.querySelector(F.container).appendChild(a.calendar);
    }
    // add events
    function d(a, b, c) {
        var d, e, f, h, i, j, k, n, r, s;
        c = o(c, a.eventDateFormat), c = c.sort(p), c = c.sort(q);
        for (n in c) {
            // if has subevents append them o event
            if (c[n].start < a.range.start && (c[n].start = new Date(a.range.start), s = " started-before"), 
            c[n].end > a.range.end && (c[n].end = new Date(a.range.end), s = " finished-after"), 
            k = g(c[n].start, a.language), c[n].end = g(c[n].end, a.language), d = document.querySelector('[data-group="' + m(c[n].group) + '"]'), 
            e = d.querySelector('[data-day="' + k + '"]'), // creates the event container
            f = document.createElement("section"), f.className = "material-calendar-event", 
            void 0 !== s && (f.className += s), // creates the event title
            h = document.createElement("h3"), h.className = "material-calendar-title", h.setAttribute("data-title", c[n].title), 
            h.insertAdjacentHTML("beforeend", void 0 === c[n].resume ? c[n].title : c[n].resume), 
            // append title to event
            f.appendChild(h), e.appendChild(f), null !== c[n].subevents) for (r in c[n].subevents) i = document.createElement("article"), 
            i.className = "material-calendar-card", null !== c[n].subevents[r].link ? (j = document.createElement("a"), 
            j.className = "material-calendar-title", j.setAttribute("href", c[n].subevents[r].link), 
            j.setAttribute("target", b.linkTarget), j.insertAdjacentHTML("beforeend", c[n].subevents[r].description), 
            i.appendChild(j)) : (j = document.createElement("h5"), j.className = "material-calendar-title", 
            i.insertAdjacentHTML("beforeend", c[n].subevents[r].description)), f.appendChild(i);
            l(f, k, d, c[n].end, c[n].start, a.language, a.eventDateFormat);
        }
    }
    // private functions
    function e(a) {
        var b = a.start.split("/"), c = a.end.split("/");
        return a.start = new Date(b[1], --b[0], 1), a.end = new Date(c[1], c[0], 0), a;
    }
    function f(a, b) {
        for (var c in b) b.hasOwnProperty(c) && (a[c] = b[c]);
        return a;
    }
    function g(a, b, c) {
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
    function h(a, b) {
        var c, d = {
            start: 0,
            end: 0
        };
        for (c in a) d[c] = g(a[c], b, "MM yyyy");
        return d.start + " - " + d.end;
    }
    function i(a, b, c) {
        var d = {
            formated: [],
            normal: []
        }, e = g(a, c, "MMM/yy"), f = new Date(a);
        do d.formated.push(e), d.normal.push(g(f, c, "MM/yyyy")), f = new Date(f.setMonth(f.getMonth() + 1)), 
        e = g(f, c, "MMM/yy"); while (b >= f);
        return d;
    }
    function j(a, b, c, d, e) {
        a = document.createElement("th"), a.className = "team", b = document.createElement("a"), 
        b.className = "material-calendar-link toggle-all", b.innerHTML = e, c = document.createElement("i"), 
        c.className = "material-calendar-caret-down", b.appendChild(c), a.appendChild(b), 
        d.appendChild(a);
    }
    function k(a, b, c, d, e) {
        var f, h = {
            formated: [],
            normal: []
        }, i = new Date(b, --a, 1), j = new Date(b, ++a, 0), k = Math.ceil(i.getDay() + j.getDate() / 7), l = i.getDay(), m = i, n = 0, o = 0;
        for (m.setHours(-24 * l), f = 0; k > f; f++) {
            // if day already appears on the calendar, get next day of week (sunday, monday ..)
            for (;e.indexOf(g(m, c, "dd/MM")) >= 0; ) m.setDate(m.getDate() + 7);
            if (h.formated.length > 1 && (n = h.formated[h.formated.length - 1].split("/")[1], 
            o = m.getMonth() + 1, o > n)) break;
            h.formated.push(g(m, c, "dd/MM")), h.normal.push(g(m, c)), e.push(g(m, c, "dd/MM")), 
            m.setDate(m.getDate() + 7);
        }
        return h;
    }
    // Calc the width and the top position of the event
    // params: {
    // 	container: 	the event container
    //	startDate: 	the start date from the event,
    // 	row: 		the actual tr that has been used to add the event
    // 	endDate: 	the end date from the event,
    //	language: 	the default language from the calendar,
    //	format: 	the event date format
    // }
    function l(a, b, c, d, e, f, h) {
        var i = 0, j = 0, k = 0, l = c.querySelector('[data-day="' + b + '"]'), // td.day that has the start date
        m = new Date(e);
        // while the startDate it's not equal to the endDate
        // increases one day and update the startDate
        for (// if td.day already has a event inside, set the new event below the existing
        l.className.indexOf("used") >= 0 && (j = Number.parseInt(l.getAttribute("data-height")), 
        a.offsetHeight >= l.getAttribute("data-available") && (j += 18, a.style.marginTop = j + "px")); m <= n(d, h); ) l.setAttribute("data-available", j || 0), 
        // check how many times tr was used
        l.className.indexOf("start") < 0 && l.className.indexOf("used") < 0 ? l.setAttribute("data-used", 1) : l.setAttribute("data-used", Number.parseInt(l.getAttribute("data-used")) + 1), 
        // if this is the first day of the event, set class start
        m.getTime() === e.getTime() && l.className.indexOf("start") < 0 && (l.className += " start"), 
        // if this isn't the first day of the event, set class start
        m.getTime() !== e.getTime() && l.className.indexOf("used") < 0 && (l.className += " used"), 
        // calc height
        k = l.getAttribute("data-used") > 1 ? l.offsetHeight : null === l.getAttribute("data-height") ? a.offsetHeight : l.getAttribute("data-height"), 
        l.setAttribute("data-height", k), i += l.offsetWidth, b = m.setHours(24), b = g(m, f), 
        l = c.querySelector('[data-day="' + b + '"]');
        a.style.width = i + "px";
    }
    // Remove all special characters from any string received as param
    function m(a) {
        return a = a.replace(/[ÀÁÂÃÄÅ]/, "A").replace(/[àáâãäå]/, "a").replace(/[ÈÉÊË]/, "E").replace(/[èéêë]/, "e").replace(/[ÌÍÏ]/, "I").replace(/[ìíï]/, "i").replace(/[ÒÓÕÔÖ]/, "O").replace(/[òóõôö]/, "o").replace(/[ÙÚÛÜ]/, "U").replace(/[ùúûü]/, "u").replace(/[Ç]/, "C").replace(/[ç]/, "c"), 
        a.replace(/[^a-z0-9]/gi, "").toLowerCase();
    }
    // Convert string to date
    // params: {
    //	date: 	the date that will be converted,
    //	format: the event date format, available formats: 'dd/mm/yyyy' and 'mm/dd/yyyy'
    // }
    function n(a, b) {
        var c = a.split("/");
        if ("dd/mm/yyyy" === b) a = new Date(c[2], --c[1], c[0]); else {
            if ("mm/dd/yyyy" !== b) throw new Error("Not implemented format");
            a = new Date(c[2], --c[0], c[1]);
        }
        return a;
    }
    // Convert all dates from events array to Date using convertStringToDate
    // params: {
    //	events: the events array that will be converted,
    //	format: the event date format, available formats: 'dd/mm/yyyy' and 'mm/dd/yyyy'
    // }
    function o(a, b) {
        for (var c in a) void 0 !== a[c] && (a[c].start = n(a[c].start, b), a[c].end = n(a[c].end, b));
        return a;
    }
    // Sort json by name
    function p(a, b) {
        var c = "group";
        return a[c] > b[c];
    }
    // Sort json by start date
    function q(a, b) {
        var c = "start";
        return a[c].getTime() > b[c].getTime() ? 1 : a[c].getTime() < b[c].getTime() ? -1 : 0;
    }
    b.prototype.createCalendar = function() {
        c(this), void 0 !== this.options.events && d(this.options, this.options.events);
    }, b.prototype.addEvents = function(a) {
        // default options
        var b, c, e = {
            linkTarget: "_blank"
        }, g = this, h = r.create(), i = "";
        // ajax options
        a = f(e, a), b = new XMLHttpRequest();
        try {
            if (a.beforeSend && a.beforeSend(), void 0 !== a.data) {
                for (c in a.data) i += c + "=" + a.data[c] + "&";
                i = i.slice(0, i.length - 1), a.url = a.url + "?" + i;
            }
            b.open("GET", a.url), b.send(), r.update(), document.querySelector(".material-calendar-header").appendChild(h), 
            b.onreadystatechange = function() {
                r.update(), 4 === b.readyState && (d(g.options, a, JSON.parse(b.responseText)), 
                r.remove(), a.success && a.success());
            }, b.onerror = function() {
                r.remove(), a.error && a.error();
            };
        } catch (j) {
            throw new Error(j);
        }
    }, b.prototype.destroy = function() {
        this.calendar.remove();
    };
    // Loading
    var r = {
        container: null,
        progress: null,
        create: function() {
            return this.container = document.createElement("div"), this.container.id = "material-calendar-loading", 
            this.child = document.createElement("div"), this.child.className = "material-calendar-progress", 
            this.container.appendChild(this.child), this.container;
        },
        update: function() {
            this.child.style.width += "25%";
        },
        remove: function() {
            this.container.remove();
        }
    };
    a.MaterialCalendar = b;
}(this);