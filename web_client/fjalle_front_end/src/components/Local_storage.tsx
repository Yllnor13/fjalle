const local_storage = {
    hardmode(request: string): void{
        localStorage.setItem('hard', JSON.stringify(request));
    },

    get_hardmode(): boolean{
        const hardmode = localStorage.getItem('hard'); // Corrected key: should be a string literal

        if (hardmode === null) {
            return false; // Or handle the case where the item doesn't exist differently
        }

        try {
            return JSON.parse(hardmode);
        } catch (error) {
            console.error("Error parsing 'cookies' from localStorage:", error);
            return false;
        }
    },

    seen_instruction(): boolean{
        const instruction = localStorage.getItem('instruct');
        return instruction === 'true';
    },

    set_instruction_seen(): void{
        localStorage.setItem('instruct', 'true');
    },

    remove_hardmode(): void{
        localStorage.removeItem('hard');
    },

    save_game_date(date: string): void {
        localStorage.setItem('GameDate', date);
    },
    
    get_game_date(): string | null {
        return localStorage.getItem('GameDate');
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

    save_win_round(num: number) {
        const keys = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth'];
        if (num >= 1 && num <= 6) {
            const key = keys[num - 1];
            const current = parseInt(localStorage.getItem(key) || '0');
            localStorage.setItem(key, JSON.stringify(current + 1));
        }
    },
    
    get_win_rounds(num: number): number {
        const keys = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth'];
        if (num >= 1 && num <= 6) {
            const key = keys[num - 1];
            return parseInt(localStorage.getItem(key) || '0');
        }
        return 0;
    },

    save_cur_streak(): void {
        const curStreak = this.get_cur_streak() + 1;
        const curStreakStr = curStreak.toString();
    
        localStorage.setItem('curstreak', curStreakStr);
    
        if (curStreak > this.get_max_streak()) {
            localStorage.setItem('maxstreak', curStreakStr);
        }
    },
    
    remove_cur_streak(): void {
        localStorage.setItem('curstreak', '0');
    },
    
    get_cur_streak(): number {
        return parseInt(localStorage.getItem('curstreak') || '0', 10);
    },
    
    get_max_streak(): number {
        return parseInt(localStorage.getItem('maxstreak') || '0', 10);
    },

    add_win(): void {
        const newWins = this.get_wins() + 1;
        localStorage.setItem('wins', newWins.toString());
    },
    
    add_loss(): void {
        const newLosses = this.get_losses() + 1;
        localStorage.setItem('losses', newLosses.toString());
    },

    get_wins(): number{
        return parseInt(localStorage.getItem('wins') || '0', 10);
    },

    get_losses(): number{
        return parseInt(localStorage.getItem('losses') || '0', 10);
    },

    add_record_bool(date: string): void {
        localStorage.setItem('statsRecordedDate', date);
    },

    get_record_bool(date: string): boolean {
        return localStorage.getItem('statsRecordedDate') === date;
    },
    
    get_attempt(): string[] {
        const attemptsString = localStorage.getItem('attempts');
        return attemptsString ? JSON.parse(attemptsString) : [];
    },
    
    save_attempt(word: string, numbers: string): void {
        var currentAttempts = this.get_attempt() || []; // Get existing attempts or empty object
        const cur_attempt = word + " " + numbers
        currentAttempts.push(cur_attempt); // Save word as key with numbers as value
        localStorage.setItem('attempts', JSON.stringify(currentAttempts));
    },
    
    clear_attempts(): void {
        localStorage.removeItem('attempts');
    }
}

export default local_storage;