// music.ts (c) 2017 David Whale

enum NoteName { //TODO add all sharps and flats here
    C2 = 65,
    //% block=C#2
    CSharp2 = 69,
    D2 = 73,
    Eb2 = 77,
    E2 = 82,
    F2 = 87,
    //% block=F#2
    FSharp2 = 92,
    G2 = 97,
    //% block=G#2
    GSharp2 = 103,
    A2 = 109,
    Bb2 = 119,
    B2 = 123,

    C3 = 131,
    //% block=C#3
    CSharp3 = 139,
    D3 = 147,
    Eb3 = 156,
    E3 = 165,
    F3 = 175,
    //% block=F#3
    FSharp3 = 185,
    G3 = 196,
    //% block=G#3
    GSharp3 = 208,
    A3 = 220,
    Bb3 = 233,
    B3 = 247,

    C4 = 262,
    //% block=C#4
    CSharp4 = 277,
    D4 = 294,
    Eb4 = 311,
    E4 = 330,
    F4 = 349,
    //% block=F#4
    FSharp4 = 370,
    G4 = 392,
    //% block=G#
    GSharp4 = 415,
    A4 = 440,
    Bb4 = 466,
    B4 = 494,

    C5 = 523,
    //% block=C#5
    CSharp5 = 555,
    D5 = 587,
    Eb5 = 622,
    E5 = 659,
    F5 = 698,
    //% block=F#5
    FSharp5 = 740,
    G5 = 784,
    //% block=G#5
    GSharp5 = 831,
    A5 = 880,
    Bb5 = 932,
    B5 = 988,
}

//% weight=100 color=#0000ff icon="*"
namespace DrWho {
    let bpm = 137
    let playing = 0
    
    export function fraction_to_ms(multiplier: number, divisor: number): number {
        // note this is sensitive to BPM changes, intentionally
        return ((60000 * 4 / bpm) * multiplier) / divisor
    }
    
    /**
     * Plays a note with a short delay after it
     * @param frequency frequency of note to play, eg:music.Note.C
     * @param multiplier multiplier for note fraction, eg:1 
     * @param divisor divisor for note fraction, eg:4
     */
    //% blockId=drwho_play_note block="play %frequency|for %multiplier| / %divisor" blockGap=8

    export function play_note(frequency: NoteName, multiplier: number, divisor: number): void {
        let l = fraction_to_ms(multiplier, divisor)
        let n1_4 = 60000/bpm
        let d = n1_4 / 10
        l -= d
        if (playing == frequency) {
            // continue slur
            basic.pause(l)
            music.rest(d)
        } else {
            playing = frequency
            music.playTone(frequency, l)
        }
        playing = 0
        music.rest(d)
    }
    /**
     * Plays a note without a short delay after it
     * @param frequency frequency of note to play, eg:music.Note.C
     * @param multiplier multiplier for note fraction, eg:1 
     * @param divisor divisor for note fraction, eg:4
     */
    //% blockId=drwho_slur_note block="slur %frequency|for %multiplier|/ %divisor" blockGap=8

    export function slur_note(frequency: NoteName, multiplier: number, divisor: number): void {
        let l = fraction_to_ms(multiplier, divisor)
        playing = frequency
        music.ringTone(frequency)
        basic.pause(l)
        // leave note playing at end, for the slur
    }
}
