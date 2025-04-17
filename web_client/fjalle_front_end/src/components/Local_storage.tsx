const local_storage = {
    accept_cookies(): void{
        localStorage.setItem('cookies', "true");
    },

    get_accept_cookies(): boolean{
        const cookiesAccepted = localStorage.getItem('cookies'); // Corrected key: should be a string literal

        if (cookiesAccepted === null) {
            return false; // Or handle the case where the item doesn't exist differently
        }

        try {
            return JSON.parse(cookiesAccepted);
        } catch (error) {
            console.error("Error parsing 'cookies' from localStorage:", error);
            return false;
        }
    },

    finished_attempt(date : string): void{
        localStorage.setItem('date', date);
    },

    //checks if the user has played today
    played_today(date : string): boolean{
        if(localStorage.getItem('date') == date){
            return true;
        }
        return false;
    },

    get_attempt() : string[] | null {
        const attemptsString = localStorage.getItem('attempts');
        return attemptsString ? JSON.parse(attemptsString) : null;
    },

    save_attempt(word : string) : void{
        const currentAttempts = this.get_attempt() || []; // Get existing attempts or initialize an empty array
        currentAttempts.push(word); // Add the new word to the array
        localStorage.setItem('attempts', JSON.stringify(currentAttempts)); // Store the updated array as a JSON string
    }
}

export default local_storage;