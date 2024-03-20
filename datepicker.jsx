import { useState } from 'react';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function App() {
    const [showDatepicker, setShowDatepicker] = useState(false);
    const [datepickerValue, setDatepickerValue] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [noOfDays, setNoOfDays] = useState([]);
    const [blankdays, setBlankdays] = useState([]);

    const initDate = () => {
        let today = new Date();
        setMonth(today.getMonth());
        setYear(today.getFullYear());
        setDatepickerValue(new Date(today.getFullYear(), today.getMonth(), today.getDate()).toDateString());
    };

    const isToday = (date) => {
        const today = new Date();
        const d = new Date(year, month, date);
        return today.toDateString() === d.toDateString() ? true : false;
    };

    const getDateValue = (date) => {
        let selectedDate = new Date(year, month, date);
        setDatepickerValue(selectedDate.toDateString());

        console.log(selectedDate.getFullYear() +"-"+ ('0'+ selectedDate.getMonth()).slice(-2) +"-"+ ('0' + selectedDate.getDate()).slice(-2));

        setShowDatepicker(false);
    };

    const getNoOfDays = () => {
        let daysInMonth = new Date(year, month + 1, 0).getDate();
        let dayOfWeek = new Date(year, month).getDay();
        let blankdaysArray = [];
        for ( let i=1; i <= dayOfWeek; i++) {
            blankdaysArray.push(i);
        }

        let daysArray = [];
        for ( let i=1; i <= daysInMonth; i++) {
            daysArray.push(i);
        }

        setBlankdays(blankdaysArray);
        setNoOfDays(daysArray);
    };

    return (
        <div className="h-screen w-screen flex items-center justify-center bg-gray-200">
            <div className="antialiased sans-serif">
                <div x-data="app()" x-init="[initDate(), getNoOfDays()]" x-cloak>
                    <div className="container mx-auto px-4 py-2 md:py-10">
                        <div className="mb-5 w-64">
                            <label htmlFor="datepicker" className="font-bold mb-1 text-gray-700 block">Select Date</label>
                            <div className="relative">
                                <input type="hidden" name="date" ref={date => this.date = date} />
                                <input
                                    type="text"
                                    readOnly
                                    value={datepickerValue}
                                    onClick={() => setShowDatepicker(!showDatepicker)}
                                    onKeyDown={(e) => e.key === "Escape" && setShowDatepicker(false)}
                                    className="w-full pl-4 pr-10 py-3 leading-none rounded-lg shadow-sm focus:outline-none focus:shadow-outline text-gray-600 font-medium"
                                    placeholder="Select date"
                                />
                                <div className="absolute top-0 right-0 px-3 py-2">
                                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                    </svg>
                                </div>
                                <div
                                    className="bg-white mt-12 rounded-lg shadow p-4 absolute top-0 left-0"
                                    style={{width: "17rem"}}
                                    x-show.transition="showDatepicker"
                                    onClick={() => setShowDatepicker(false)}
                                >
                                    {/* Calendar contents here */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
