// Sequencer.ts (c) 2017 David Whale
//TODO: This is really Sequencer + Synthesiser
//and a load of musical notes in a specific tuning

//TODO: I would like to separate this entirely from Music and just use a pitch generator directly
//so that we could do our own synthesis later

namespace synthesiser {
    let pitch_shift = 0
    let octave_shift = 0
    let current_frequency = 0

    export function get_frequency(): number {
        return current_frequency
    }

    //adaptor to allow later separation from Music module
    //this will become part of a new Synthesiser
    function tone_for(frequency: number, duration: number) void {
        //TODO: separate this from music and use native pitch generator directly
        current_frequency = frequency
        music.playTone(frequency, duration)
    }

    //adaptor to allow later separation from Music module
    //this will become part of a new Synthesiser
    function tone(frequency: number) void {
        //TODO: separate this from music and use native pitch generator directly
        current_frequency = frequency
        music.ringTone(frequency)
    }

    //adaptor to allow later separation from Music module
    //this will become part of a new Synthesiser
    function stop() void {
        //TODO: separate this from music and use native pitch generator directly
        current_frequency = 0
        music.rest(0)
    }
}

//TODO: I would like these to be an enumeration that is mapped to an internal frequency table
//it makes it easier to do key changes and octave shifts etc
// we could have a single O0 frequency table and multiply it up, but that might be
// inaccurate and need local octave tweaks.
// alternatively we could have a high octave table and divide it down.
// again, that might be inaccurate at some frequencies and require tweaks.
// it's a pain, but it might be best to have all supported octaves in a single table
// and index into it using octave/12, to get the best playback accuracy
// note that this is more to do with synthesis and less to do with sequencing
// so perhaps we need to abstract that into a dummy synthesiser for now and solve later?

//TODO: The frequencies need to go into a 'tuning' table.
//we might use different tunings, but the note names will be the same

//TODO: I would like to add a better DSL to define all the variances on note play styles (string)
//name it M3L (Micro:bit Music Markup Language)

enum NoteName {
    //TODO: add all sharps and flats here
    //TODO: base notes as enumeration 0..11 (index into octave)
    //then define alias names (like sharps and flats, double sharps etc)
    //then define octave offsets on top of those as named notes
    //It'll be a long list though. Hmm.
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

enum PlayStyle {
    Normal = 0,
    Slur = 1,
    Slide = 2,
    Staccato = 3
}
//Tremolo? At same time as Slur/Slide
//NOTE: Tremolo is a specific 'rate' of frequency modulation
//it will require a much better synthesiser engine
//which is a good reason to separate ourselves from the existing PXT Music module now
//so we need a 'modulation wheel' and a 'pitch bend wheel' in the new synth module


//% weight=100 color=#0000ff icon="*"
namespace Sequencer {
    // constants to allow different play styles to be customised
    let stacatto_divisor = 2
    let end_note_divisor = 10

    let bpm = 137

    function fraction_to_ms(multiplier: number, divisor: number): number {
        // note this is sensitive to BPM changes, intentionally
        return ((60000 * 4 / bpm) * multiplier) / divisor
    }

    /**
     * Changes the beats per minute value
     * @param b the beats per minute to use, eg:120
     */

    //% blockId=sequencer_bpm block="set BPM %bpm" blockGap=8

    export function set_bpm(b: number) void {
        bpm = b
    }

    //TODO: get_bpm (look at how to implement getters)
    //TODO: change_bpm_by??

    /**
     * Plays a note
     * @param note the note to play, eg:NoteName.C1
     * @param multiplier multiplier for note fraction, eg:1 
     * @param divisor divisor for note fraction, eg:4
     */
    //% blockId=sequencer_play block="play %frequency|for %multiplier|/%divisor|using style %style" blockGap=8

    export function play(note: NoteName, multiplier: number, divisor: number, style: PlayStyle): void {
        // at the moment they are one and the same, but later they will be separated
        frequency = note
        let l = fraction_to_ms(multiplier, divisor)
        // *technically* a beat is not always a quarter note
        // but uses MIDI convention that beats per min = 1/4 notes per min
        let n1_4 = 60000/bpm
        if (style == Normal) {
            let d = n1_4 / end_note_divisor
            l -= d
            if (synthesiser.get_frequency() == frequency) {
                // continue slur
                basic.pause(l)
                // rest turns off tone generation
                synthesiser.stop()
                basic.pause(d)
            } else {
                synthesiser.tone_for(frequency, l)
            }
            current_frequency = 0
            basic.pause(d)
        } else if (style == Slur) {
            synthesiser.tone(frequency)
            basic.pause(l)
            // leave note playing at end, for the slur
        } else if (style == Slide) {
            //TODO: frequency bend in l/n steps from old frequency to new frequency
        } else if (style = Stacatto) {
            //NOTE: we don't support a slur into a staccato note
            d = l / staccato_divisor
            l -= d
            synthesiser.tone_for(frequency, l)
        }
    }
}
