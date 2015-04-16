// @license Material Calendar (v. 0.0.2.1 beta)

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
			eventDateFormat: 'dd/MM/yyyy',
			weekDay: null
		};

		// personal options
		if (arguments[0] && typeof arguments[0] === 'object') {
			this.options = getConfiguration(defaults, arguments[0]);
		} else {
			this.options = defaults;
		}

		// update range with date format options
		this.options.range = updateRange(this.options.range, this.options.eventDateFormat);
		this.options.eventDateFormat = this.options.eventDateFormat.toLowerCase();
		this.options.groups = this.options.groups.sort(function(a, b) { return a < b; });

		this.createCalendar();
	}

	MaterialCalendar.prototype.createCalendar = function() {
		build(this);
		adjustColspan();
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
		key,
		response;

		// ajax options
		opt = getConfiguration(defaults, opt);

		httpReq = new XMLHttpRequest();

		try {
			if (opt.beforeSend) { opt.beforeSend(); }

			if (opt.data !== undefined) {
				// todo: check if is better to change for just $.serialize() or json
				for (key in opt.data) {
					if (opt.data.hasOwnProperty(key)) {
						data += key + '=' + opt.data[key] + '&';
					}
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
					response = JSON.parse(httpReq.responseText);
					if (response.length > 0) {
						markEvents(_this.options, opt, response);
					}

					Loading.remove();

					if (opt.success) { opt.success(); }
				}
			};

			httpReq.onerror = function() {
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
		tbodyMonth = [], weekTable, monthChild, weekChild, months, month, weeks, week,
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
			if (months.formated.hasOwnProperty(month)) {
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
				helper = convertStringToDate(months.normal[month], opt.eventDateFormat);
				opt.weekDay = opt.weekDay === null ? helper.getDay() : opt.weekDay;

				// get all weeks
				weeks = Week.get(helper, opt.range, opt.weekDay, opt.language);

				monthChild = document.createElement('td');
				monthChild.className = 'month';

				// create a table for weeks in each month
				weekTable = document.createElement('table');
				weekTable.className = 'weeks';
				monthChild.appendChild(weekTable);

				weekChild = document.createElement('tr');
				monthChild.querySelector('.weeks').appendChild(weekChild);

				for (week in weeks.formated) {
					if (weeks.formated.hasOwnProperty(week)) {
						// create an td child for each week
						helper = document.createElement('td');
						helper.className = 'week weekt-title';
						helper.setAttribute('data-week', weeks.normal[week]);
						helper.insertAdjacentHTML('beforeend', weeks.formated[week]);
						temporary.appendChild(helper);

						// create an td child for each week
						weekChild = document.createElement('td');
						weekChild.className = 'week week-content';
						weekChild.setAttribute('data-week', weeks.normal[week]);

						// create a table for days
						weekChild.appendChild(Day.getHtml(weeks.normal[week], opt.range.end, opt.language, opt.eventDateFormat));
						monthChild.querySelector('tr').appendChild(weekChild);
					}
				}

				tbodyMonth.push(monthChild);
				trChild.querySelector('.weeks thead').appendChild(temporary);
			}
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

			for (count = 0; count < tbodyMonth.length; count++) {
				trChild = tbodyMonth[count].cloneNode(true);
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
		var row, actualElement, eventContainer, eventChild, subeventContainer, subeventChild, start, event, subevent, classe, helper;

		events = convertEventsDate(events, calendarOpt.eventDateFormat);
		events = events.sort(sortJsonByName);
		events = events.sort(sortJsonByStartDate);

		for (event in events) {
			if (events.hasOwnProperty(event)) {
				classe = '';

				if (events[event].start.getTime() > calendarOpt.range.end.getTime()) {
					events = events.splice(events.indexOf(event), 1);
					break;
				}

				if (events[event].start.getTime() < calendarOpt.range.start.getTime()) {
					events[event].start = new Date(calendarOpt.range.start);
					classe = ' started-before';
				}

				if (events[event].end.getTime() > calendarOpt.range.end.getTime()) {
					events[event].end = new Date(calendarOpt.range.end);
					classe = ' finished-after';
				}

				start = convertDate(events[event].start, calendarOpt.language);
				events[event].end = convertDate(events[event].end, calendarOpt.language);

				row = document.querySelector('[data-group="' + removeSpecialChars(events[event].group) + '"]');
				actualElement = row.querySelector('[data-day="' + start + '"]');

				// creates the event container
				eventContainer = document.createElement('section');
				eventContainer.className = 'material-calendar-event';
				if (classe !== undefined) {
					eventContainer.className += classe;
				}

				// creates the event title
				eventChild = document.createElement('h3');
				eventChild.className = 'material-calendar-title';
				helper = document.createElement('span');
				helper.insertAdjacentHTML('beforeend', events[event].title + '\n' + convertDate(events[event].start, calendarOpt.language) + ' - ' + events[event].end);
				eventChild.insertAdjacentHTML('beforeend', events[event].resume === undefined ? events[event].title : events[event].resume);
				eventChild.appendChild(helper);

				// append title to event
				eventContainer.appendChild(eventChild);
				actualElement.appendChild(eventContainer);

				// if has subevents append them o event
				if (events[event].subevents !== null) {
					for (subevent in events[event].subevents) {
						if (events[event].subevents.hasOwnProperty(subevent)) {
							subeventContainer = document.createElement('article');
							subeventContainer.className = 'material-calendar-card';

							if (events[event].subevents[subevent].link !== null) {
								subeventChild = document.createElement('a');
								subeventChild.className = 'material-calendar-title';
								helper = document.createElement('span');
								helper.insertAdjacentHTML('beforeend', events[event].subevents[subevent].description);
								subeventChild.setAttribute('href', events[event].subevents[subevent].link);
								subeventChild.setAttribute('target', eventsOpt.linkTarget);
								subeventChild.insertAdjacentHTML('beforeend', events[event].subevents[subevent].description);
								subeventChild.appendChild(helper);

								subeventContainer.appendChild(subeventChild);
							} else {
								subeventChild = document.createElement('h5');
								subeventChild.className = 'material-calendar-title';
								subeventContainer.insertAdjacentHTML('beforeend', events[event].subevents[subevent].description);
							}

							eventContainer.appendChild(subeventContainer);
						}
					}
				}

				calcEventPositionAndWidth(eventContainer, start, row, events[event].end, events[event].start, calendarOpt.language, calendarOpt.eventDateFormat);
			}
		}
	}

	// private functions
	function updateRange(range, format) {
		range.start = convertStringToDate(range.start, format);
		range.end = convertStringToDate(range.end, format);

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
			if (range.hasOwnProperty(date)) {
				title[date] = convertDate(range[date], language, 'MM yyyy');
			}
		}

		return title.start + ' - ' + title.end;
	}

	function getMonths(startDate, endDate, language) {
		var months = { formated: [], normal: [] },
			formatedMonth = convertDate(startDate, language, 'MMM/yy'),
			actualMonth = new Date(startDate),
			lastMonth = new Date(endDate);

		lastMonth.setMonth(lastMonth.getMonth() + 1);

		while (actualMonth < lastMonth) {
			if (actualMonth.getMonth() === startDate.getMonth()) {
				actualMonth.setDate(startDate.getDate());
			}
			else if (actualMonth.getMonth() === endDate.getMonth()) {
				actualMonth.setDate(endDate.getDate());
			}
			else {
				actualMonth.setDate(1);
			}

			months.formated.push(formatedMonth);
			months.normal.push(convertDate(actualMonth, language));

			actualMonth = new Date(actualMonth.setMonth(actualMonth.getMonth() + 1));
			formatedMonth = convertDate(actualMonth, language, 'MMM/yy');
		}

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

	// Calc the width and the top position of the event
	// params: {
	// 	container: 	the event container
	//	startDate: 	the start date from the event,
	// 	row: 		the actual tr that has been used to add the event
	// 	endDate: 	the end date from the event,
	//	language: 	the default language from the calendar,
	//	format: 	the event date format
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

			if (container.offsetHeight >= parent.getAttribute('data-available')) {
				top += 18;
				container.style.marginTop = top + 'px';
			}
		}

		// while the startDate it's not equal to the endDate
		// increases one day and update the startDate
		while (actualDate.getTime() <= convertStringToDate(endDate, format).getTime()) {
			parent.setAttribute('data-available', top || 0);

			// check how many times tr was used
			if (parent.className.indexOf('start') < 0 && parent.className.indexOf('used') < 0) {
				parent.setAttribute('data-used', 1);
			} else {
				parent.setAttribute('data-used', Number.parseInt(parent.getAttribute('data-used')) + 1);
			}

			// if this is the first day of the event, set class start
			if (actualDate.getTime() === realDate.getTime() && parent.className.indexOf('start') < 0) {
				parent.className += ' start';
			}

			// if this isn't the first day of the event, set class start
			if (actualDate.getTime() !== realDate.getTime() && parent.className.indexOf('used') < 0) {
				parent.className += ' used';
			}

			// calc height
			if (parent.getAttribute('data-used') > 1) {
				height = parent.offsetHeight;
			}
			else if (parent.getAttribute('data-height') === null) {
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
	//	format: the event date format, available formats: 'dd/mm/yyyy' and 'mm/dd/yyyy'
	// }
	function convertStringToDate(date, format) {
		var splitDate = date.split('/');
		format = format.toLowerCase();

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
	//	format: the event date format, available formats: 'dd/mm/yyyy' and 'mm/dd/yyyy'
	// }
	function convertEventsDate(events, format) {
		for (var e in events) {
			if (events.hasOwnProperty(e)) {
				events[e].start = convertStringToDate(events[e].start, format);
				events[e].end = convertStringToDate(events[e].end, format);
			}
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
		if (j[prop].getTime() > k[prop].getTime()) { return 1; }
		else if (j[prop].getTime() < k[prop].getTime()) { return -1; }
		return 0;
	}

	// Weeks
	var Week = {
		list: null,
		get: function(date, range, weekDay, language) {
			this.list = { formated: [], normal: [] };

			var startDateMonth = range.start.getMonth(),
				endDate = range.end,
				month = date.getMonth();

			// get the first weekday of the month
			if (month !== startDateMonth) {
				date = this.getFirstWeekDay(date, weekDay);
			}

			// get all the weekday from the month
			while (date.getMonth() === month) {
				this.addWeek(date, language);
				date.setDate(date.getDate() + 7);
				if (date.getMonth() === endDate.getMonth() && date.getDate() > endDate.getDate()) { break; }
			}

			return this.list;
		},
		getFirstWeekDay: function(date, weekDay) {
			date.setDate(1);

			while (date.getDay() !== weekDay) {
				date.setDate(date.getDate() + 1);
			}

			return date;
		},
		addWeek: function(date, language) {
			this.list.formated.push(convertDate(date, language, 'dd/MM'));
			this.list.normal.push(convertDate(date, language));
		}
	},
	Day = {
		table: null,
		getHtml: function(week, rangeEnd, language, format) {
			var dayTbody = document.createElement('tbody'),
				dayChild,
				count = 0;

			week = convertStringToDate(week, format);
			this.table = document.createElement('table');
			this.table.className = 'days';
			this.table.appendChild(dayTbody);

			for (count = 0; count < 7; count++) {
				dayChild = document.createElement('td');
				dayChild.className = 'day';

				dayChild.setAttribute('data-day', convertDate(week, language));
				this.table.querySelector('tbody').appendChild(dayChild);

				if (week.getMonth() === rangeEnd.getMonth() && week.getDate() >= rangeEnd.getDate()) { break; }
				week.setDate(week.getDate() + 1);
			}

			return this.table;
		}
	},
	Loading = {
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

	function adjustColspan() {
		var months = document.querySelectorAll('.calendar-table > tbody tr:last-child .month'), month,
			rows, row, days = [];

		for (month in months) {
			if (months.hasOwnProperty(month) && typeof months[month] === 'object') {
				month = months[month].querySelector('tr').querySelectorAll('.day');
				days.push(month.length - 1);
			}
		}

		rows = document.querySelectorAll('.calendar-table > thead > tr, tbody > tr');

		for (row in rows) {
			if (rows.hasOwnProperty(row) && typeof rows[row] === 'object') {
				months = rows[row].querySelectorAll('.month');
				for (month in months) {
					if (months.hasOwnProperty(month) && typeof months[month] === 'object') {
						months[month].setAttribute('colspan', days[month]);
					}
				}
			}
		}
	}

	window.MaterialCalendar = MaterialCalendar;
})(this);
