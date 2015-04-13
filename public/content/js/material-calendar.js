// @license Material Calendar (v. 0.0.1.2 beta)

(function(window) {
	'use strict';

	function MaterialCalendar() {
		this.calendar = null;
		this.messages = {
			all: 'todos'
		};

		// default options
		var defaults = {
			language: 'pt-BR',
			className: 'full',
			container: 'body',
			eventDateFormat: 'dd/MM/yyyy'
		};

		// personal options
		if (arguments[0] && typeof arguments[0] === 'object') {
			this.options = getConfiguration(defaults, arguments[0]);
		} else {
			this.options = defaults;
		}

		// update range with date format options
		this.options.range = updateRange(this.options.range);
		this.options.eventDateFormat = this.options.eventDateFormat.toLowerCase();
		this.options.groups = this.options.groups.sort(function(a, b) { return a < b; });

		this.createCalendar();
	}

	MaterialCalendar.prototype.createCalendar = function() {
		build(this);
		if (this.options.events !== undefined) {
			markEvents(this.options, this.options.events);
		}
	};

	MaterialCalendar.prototype.addEvents = function(opt) {
		// default options
		var defaults = { linkTarget: '_blank' },
		httpReq,
		_this = this,
		loading = Loading.create(),
		data = '',
		key;

		// ajax options
		opt = getConfiguration(defaults, opt);

		httpReq = new XMLHttpRequest();

		try {
			if (opt.beforeSend) { opt.beforeSend(); }

			if (opt.data !== undefined) {
				for (key in opt.data) {
					data += key + '=' + opt.data[key] + '&';
				}

				data = data.slice(0, data.length - 1);

				opt.url = opt.url + '?' + data;
			}

			httpReq.open('GET', opt.url);
			httpReq.send();

			Loading.update();

			document.querySelector('.material-calendar-header').appendChild(loading);

			httpReq.onreadystatechange = function() {
				Loading.update();

				if (httpReq.readyState === 4) {
					markEvents(_this.options, opt, JSON.parse(httpReq.responseText));
					Loading.remove();

					if (opt.success) { opt.success(); }
				}
			};

			httpReq.onerror = function(err) {
				Loading.remove();
				if (opt.error) { opt.error(); }
			};
		}
		catch (err) {
			throw new Error(err);
		}
	};

	MaterialCalendar.prototype.destroy = function() {
		this.calendar.remove();
	};

	// build
	function build(MaterialCalendar) {
		var opt = MaterialCalendar.options,
		msg = MaterialCalendar.messages,
		hasGroups = opt.groups !== undefined,
		header, headerTitle, body, table, thead, tbody, tr, trChild, link, icon,
		tbodMonth = [], weekList = [], weekTable, dayTable, monthChild, weekChild, dayChild, months, month, weeks, week,
		rows, temporary, helper, count, i;

		// calendar container
		MaterialCalendar.calendar = document.createElement('section');
		MaterialCalendar.calendar.className = 'material-calendar-container ' + opt.className;

		// calendar header
		header = document.createElement('header');
		header.className = 'material-calendar-header';
		headerTitle = document.createElement('h2');
		headerTitle.insertAdjacentHTML('beforeend', getTitle(opt.range, opt.language));
		header.appendChild(headerTitle);
		MaterialCalendar.calendar.appendChild(header);

		// calendar body
		body = document.createElement('section');
		body.className = 'material-calendar-body';

		// table
		table = document.createElement('table');
		table.className = 'calendar-table';

		// table thead
		thead = document.createElement('thead');
		tr = document.createElement('tr');

		// table body
		tbody = document.createElement('tbody');
		tr = document.createElement('tr');

		// if calendar has groups in options
		// append a dropdown for all groups
		if (hasGroups) {
			getGroupTitle(thead, link, icon, tr, msg.all);

			temporary = document.createElement('tr');
			trChild = document.createElement('th');
			trChild.className = 'team';
			temporary.appendChild(trChild);
		}

		thead.appendChild(tr);
		tbody.appendChild(temporary || tr);

		// get months from options range and create the header
		// with the months and weeks
		months = getMonths(opt.range.start, opt.range.end, opt.language);

		for (month in months.formated) {
			// creates a th child for each month
			trChild = document.createElement('th');
			trChild.className = 'month';
			trChild.insertAdjacentHTML('beforeend', months.formated[month]);

			// append th child in thead
			tr = thead.querySelector('tr');
			tr.appendChild(trChild);

			// append th child in tbody
			trChild = document.createElement('td');
			trChild.className = 'month';
			tr = tbody.lastElementChild;
			tr.appendChild(trChild);

			// create a table for weeks
			weeks = document.createElement('table');
			weeks.className = 'weeks';
			temporary = document.createElement('thead');
			weeks.appendChild(temporary);
			trChild.appendChild(weeks);

			// create a tr for the week
			temporary = document.createElement('tr');
			helper = months.normal[month].split('/');

			// get all weeks
			weeks = getWeeks(helper[0], helper[1], opt.language, opt.eventDateFormat, weekList);

			monthChild = document.createElement('td');
			monthChild.className = 'month';

			// create a table for weeks in each month
			weekTable = document.createElement('table');
			weekTable.className = 'weeks';
			monthChild.appendChild(weekTable);

			weekChild = document.createElement('tr');
			monthChild.querySelector('.weeks').appendChild(weekChild);

			for (week in weeks) {
				// create an td child for each week
				helper = document.createElement('td');
				helper.insertAdjacentHTML('beforeend', weeks[week]);
				temporary.appendChild(helper);

				// create an td child for each week
				weekChild = document.createElement('td');
				weekChild.className = 'week';
				weekChild.setAttribute('data-week', weeks[week]);

				// create a table for days
				dayTable = document.createElement('table');
				dayTable.className = 'days';
				helper = document.createElement('tbody');
				dayTable.appendChild(helper);

				helper = weeks[week].split('/');

				for (count = 0; count < 7; count++) {
					dayChild = document.createElement('td');
					dayChild.className = 'day';
					dayChild.setAttribute('data-day', convertDate(new Date(2015, (Number(helper[1]) - 1), (Number(helper[0]) + count)), opt.language));
					dayTable.querySelector('tbody').appendChild(dayChild);
				}

				weekChild.appendChild(dayTable);
				monthChild.querySelector('tr').appendChild(weekChild);
			}

			tbodMonth.push(monthChild);
			trChild.querySelector('.weeks thead').appendChild(temporary);
		}

		// append a row for each group in options or just one for the main content
		rows = hasGroups ? opt.groups.length : 1;
		for (i = 0; i < rows; i++) {
			tr = document.createElement('tr');
			tbody.appendChild(tr);

			// if has group append a th child with the group title
			if (hasGroups) {
				getGroupTitle(trChild, link, icon, tr, opt.groups[i]);
				tr.setAttribute('data-group', removeSpecialChars(opt.groups[i]));
			}

			for (count = 0; count < tbodMonth.length; count++) {
				trChild = tbodMonth[count].cloneNode(true);
				tr.appendChild(trChild);
			}
		}

		table.appendChild(thead);
		table.appendChild(tbody);

		// append table to body
		body.appendChild(table);
		MaterialCalendar.calendar.appendChild(body);

		// append doc to container set in configuration
		document.querySelector(opt.container).appendChild(MaterialCalendar.calendar);
	}

	// add events
	function markEvents(calendarOpt, eventsOpt, events) {
		var row, actualElement, eventContainer, eventChild, subeventContainer, subeventChild, start, e, s;

		events = convertEventsDate(events, calendarOpt.eventDateFormat);
		events = events.sort(sortJsonByStartDate);
		events = events.sort(sortJsonByName);

		for (e in events) {
			if (events[e].start < calendarOpt.range.start) {
				events[e].start = new Date(calendarOpt.range.start);
			}

			if (events[e].end > calendarOpt.range.end) {
				events[e].end = new Date(calendarOpt.range.end);
			}

			start = convertDate(events[e].start, calendarOpt.language);
			events[e].end = convertDate(events[e].end, calendarOpt.language);

			row = document.querySelector('[data-group="' + removeSpecialChars(events[e].group) + '"]');
			actualElement = row.querySelector('[data-day="' + start + '"]');

			// creates the event container
			eventContainer = document.createElement('section');
			eventContainer.className = 'material-calendar-event';

			// creates the event title
			eventChild = document.createElement('h3');
			eventChild.className = 'material-calendar-title';
			eventChild.setAttribute('data-title', events[e].title);
			eventChild.insertAdjacentHTML('beforeend', events[e].resume === undefined ? events[e].title : events[e].resume);

			// append title to event
			eventContainer.appendChild(eventChild);
			actualElement.appendChild(eventContainer);

			// if has subevents append them o event
			if (events[e].subevents !== null) {
				for (s in events[e].subevents) {
					subeventContainer = document.createElement('article');
					subeventContainer.className = 'material-calendar-card';

					if (events[e].subevents[s].link !== null) {
						subeventChild = document.createElement('a');
						subeventChild.className = 'material-calendar-title';
						subeventChild.setAttribute('href', events[e].subevents[s].link);
						subeventChild.setAttribute('target', eventsOpt.linkTarget);
						subeventChild.insertAdjacentHTML('beforeend', events[e].subevents[s].description);

						subeventContainer.appendChild(subeventChild);
					} else {
						subeventChild = document.createElement('h5');
						subeventChild.className = 'material-calendar-title';
						subeventContainer.insertAdjacentHTML('beforeend', events[e].subevents[s].description);
					}

					eventContainer.appendChild(subeventContainer);
				}
			}

			calcEventPositionAndWidth(eventContainer, start, row, events[e].end, events[e].start, calendarOpt.language, calendarOpt.eventDateFormat);
		}
	}

	// private functions
	function updateRange(range) {
		var start = range.start.split('/'),
		end = range.end.split('/');

		range.start = new Date(start[1], --start[0], 1);
		range.end = new Date(end[1], end[0], 0);

		return range;
	}

	function getConfiguration(source, properties) {
		for (var prop in properties) {
			if (properties.hasOwnProperty(prop)) {
				source[prop] = properties[prop];
			}
		}

		return source;
	}

	function convertDate(date, language, format) {
		var retorno;

		switch (format) {
			case 'MM yyyy':
				retorno = date.toLocaleDateString(language, {
				year: 'numeric',
				month: 'short'
			});
			break;
			case 'MMM/yy':
				retorno = date.toLocaleDateString(language, {
				year: '2-digit',
				month: 'short'
			});
			break;
			case 'MM/yyyy':
				retorno = date.toLocaleDateString(language, {
				year: 'numeric',
				month: 'numeric'
			});
			break;
			case 'dd/MM':
				retorno = date.toLocaleDateString(language, {
				month: 'numeric',
				day: 'numeric'
			});
			break;
			default:
				retorno = date.toLocaleDateString(language, {
				year: 'numeric',
				month: 'numeric',
				day: 'numeric'
			});
			break;
		}

		return retorno;
	}

	function getTitle(range, language) {
		var title = { start: 0, end: 0 }, date;

		for (date in range) {
			title[date] = convertDate(range[date], language, 'MM yyyy');
		}

		return title.start + ' - ' + title.end;
	}

	function getMonths(startDate, endDate, language) {
		var months = { formated: [], normal: [] },
		formatedMonth = convertDate(startDate, language, 'MMM/yy'),
		actualMonth = new Date(startDate);

		do {
			months.formated.push(formatedMonth);
			months.normal.push(convertDate(actualMonth, language, 'MM/yyyy'));

			actualMonth = new Date(actualMonth.setMonth(actualMonth.getMonth() + 1));
			formatedMonth = convertDate(actualMonth, language, 'MMM/yy');
		} while (actualMonth <= endDate);

		return months;
	}

	function getGroupTitle(trChild, link, icon, tr, text) {
		trChild = document.createElement('th');
		trChild.className = 'team';
		link = document.createElement('a');
		link.className = 'material-calendar-link toggle-all';
		link.innerHTML = text;
		icon = document.createElement('i');
		icon.className = 'material-calendar-caret-down';
		link.appendChild(icon);
		trChild.appendChild(link);
		tr.appendChild(trChild);
	}

	function getWeeks(month, year, language, format, weekList) {
		var weeks = [],
			firstDay = new Date(year, --month, 1),
			lastDay = new Date(year, ++month, 0),
			totalWeeks = Math.ceil(firstDay.getDay() + lastDay.getDate() / 7),
			day = firstDay.getDay(),
			date = firstDay,
			lastMonth = 0,
			actualMonth = 0,
			i;

		date.setHours(-24 * day);
		for (i = 0; i < totalWeeks; i++) {

			// if day already appears on the calendar, get next day of week (sunday, monday ..)
			while (weekList.indexOf(convertDate(date, language, 'dd/MM')) >= 0) {
				date.setDate(date.getDate() + 7);
			}

			if (weeks.length > 1) {
				lastMonth = weeks[weeks.length - 1].split('/')[1];
				actualMonth = date.getMonth() + 1;

				if (lastMonth < actualMonth) { break; }
			}

			weeks.push(convertDate(date, language, 'dd/MM'));
			weekList.push(convertDate(date, language, 'dd/MM'));
			date.setDate(date.getDate() + 7);
		}

		return weeks;
	}

	// Calc the width and the top position of the event
	// params: {
	// 	container: 	the event container
	//	startDate: the start date from the event,
	// 	row: 				the actual tr that has been used to add the event
	// 	endDate: 	the end date from the event,
	//	language: 	the default language from the calendar,
	//	format: 		the event date format
	// }
	function calcEventPositionAndWidth(container, startDate, row, endDate, realDate, language, format) {
		var width = 0,
			top = 0,
			height = 0,
			parent = row.querySelector('[data-day="' + startDate + '"]'), // td.day that has the start date
			actualDate = new Date(realDate);

		// if td.day already has a event inside, set the new event below the existing
		if (parent.className.indexOf('used') >= 0) {
			top = Number.parseInt(parent.getAttribute('data-height'));
			top += 18;
			container.style.marginTop = top + 'px';
		}

		// while the startDate it's not equal to the endDate
		// increases one day and update the startDate
		while (actualDate <= convertStringToDate(endDate, format)) {
			if (actualDate.getTime() === realDate.getTime() && parent.className.indexOf('start') < 0) {
				parent.className = 'day start';
			}

			if (actualDate.getTime() !== realDate.getTime() && parent.className.indexOf('used') < 0) {
				parent.className = 'day used';
			}

			if (parent.getAttribute('data-height') === null) {
				height = container.offsetHeight;
			}
			else {
				height = parent.getAttribute('data-height');
			}

			parent.setAttribute('data-height', height);

			width += parent.offsetWidth;
			startDate = actualDate.setHours(24);
			startDate = convertDate(actualDate, language);
			parent = row.querySelector('[data-day="' + startDate + '"]');
		}

		container.style.width = width + 'px';
	}

	// Remove all special characters from any string received as param
	function removeSpecialChars(string) {
		string = string.replace(/[ÀÁÂÃÄÅ]/, 'A').replace(/[àáâãäå]/, 'a').replace(/[ÈÉÊË]/, 'E').replace(/[èéêë]/, 'e').replace(/[ÌÍÏ]/, 'I').replace(/[ìíï]/, 'i').replace(/[ÒÓÕÔÖ]/, 'O').replace(/[òóõôö]/, 'o').replace(/[ÙÚÛÜ]/, 'U').replace(/[ùúûü]/, 'u').replace(/[Ç]/, 'C').replace(/[ç]/, 'c');
		return string.replace(/[^a-z0-9]/gi, '').toLowerCase();
	}

	// Convert string to date
	// params: {
	//	date: 	the date that will be converted,
	//	format: the event date format, avaliable formats: 'dd/mm/yyyy' and 'mm/dd/yyyy'
	// }
	function convertStringToDate(date, format) {
		var splitDate = date.split('/');
		if (format === 'dd/mm/yyyy') {
			date = new Date(splitDate[2], --splitDate[1], splitDate[0]);
		} else if (format === 'mm/dd/yyyy') {
			date = new Date(splitDate[2], --splitDate[0], splitDate[1]);
		} else {
			throw new Error('Not implemented format');
		}

		return date;
	}

	// Convert all dates from events array to Date using convertStringToDate
	// params: {
	//	events: the events array that will be converted,
	//	format: the event date format, avaliable formats: 'dd/mm/yyyy' and 'mm/dd/yyyy'
	// }
	function convertEventsDate(events, format) {
		for (var e in events) {
			events[e].start = convertStringToDate(events[e].start, format);
			events[e].end = convertStringToDate(events[e].end, format);
		}

		return events;
	}

	// Sort json by name
	function sortJsonByName(j, k) {
		var prop = 'group';
		return j[prop] > k[prop];
	}

	// Sort json by start date
	function sortJsonByStartDate(j, k) {
		var prop = 'start';
		if (j[prop] > k[prop]) { return 1; }
		else if (j[prop] < k[prop]) { return -1; }
		return 0;
	}

	// Loading
	var Loading = {
		container: null,
		progress: null,
		create: function() {
			this.container = document.createElement('div');
			this.container.id = 'material-calendar-loading';

			this.child = document.createElement('div');
			this.child.className = 'material-calendar-progress';
			this.container.appendChild(this.child);

			return this.container;
		},
		update: function() {
			this.child.style.width += '25%';
		},
		remove: function() {
			this.container.remove();
		}
	};

	window.MaterialCalendar = MaterialCalendar;
})(this);
