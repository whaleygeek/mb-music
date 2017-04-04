// Music.ts (c) 2017 David Whale

namespace synthesiser {
    //TODO: This is currently not surfaced as real blocks (yet)
    let pitch_shift = 0
    let octave_shift = 0
    let current_frequency = 0

    export function frequency(): number {
        return current_frequency
    }

    function tone_for(frequency: number, duration: number) void {
        current_frequency = frequency
        pins.analogPitch(frequency, duration)
        current_frequency = 0
    }

    function tone(frequency: number) void {
        current_frequency = frequency
        pins.analogPitch(frequency, 0)
    }

    function stop() void {
        tone(0, 0)
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
    let end_note_divisor = 10 // 10%
    let stacatto_divisor = 2 // 50%

    let bpm = 137

    function fraction_to_ms(multiplier: number, divisor: number): number {
        // note this is sensitive to BPM changes, intentionally
        return ((60000 * 4 / bpm) * multiplier) / divisor
    }

    /**
     * Sets the tempo
     * @param bpm The new tempo in beats per minute, eg: 120
     */
    //% blockId=sequencer_set_tempo block="set tempo to (bpm)|%value"
    //% bpm.min=4 bpm.max=400
    export function setBPM(b: number): void {
        if (b > 0) {
            bpm = Math.max(1, b);
        }
    }

    /**
     * Gets the tempo in beats per minute.
     */
    //% blockId=sequencer_tempo block="tempo (bpm)" blockGap=8
    export function tempo(): number {
        return bpm
    }

    /**
     * Change the tempo
     * @param bpm The change in beats per minute to the tempo, eg: 20
     */
    //% blockId=sequencer_change_tempo block="change tempo by (bpm)|%value" blockGap=8
    export function changeBPM(diff: number): void {
        bpm += diff
    }

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
        // but we use the MIDI convention, where beats-per-min = 1/4notes per-min
        let n1_4 = 60000/bpm
        if (style == Normal) {
            let d = n1_4 / end_note_divisor
            l -= d
            if (synthesiser.frequency() == frequency) {
                // continue slur
                basic.pause(l)
                // rest turns off tone generation
                synthesiser.stop()
                basic.pause(d)
            } else {
                synthesiser.tone_for(frequency, l)
            }
            basic.pause(d)
        } else if (style == Slur) {
            synthesiser.tone(frequency)
            basic.pause(l)
            // leave note playing at end, for the slur
        } else if (style == Slide) {
            //TODO: This is flawed at the moment
            //if previous note was a Normal, freq will always be 0 when we get here
            freq_now = synthesiser.frequency()
            if (freq_now == 0) {
                // nothing playing, so just play a normal note
                synthesiser.tone_for(frequency, l)
            }
            else {
                steps = 10
                time_div = d/10
                freq_div = (frequency - freq_now)/10
                f = freq_now
                for (let i=0; i<steps; i++) {
                    synthesiser.tone_for(f, time_div)
                    f += freq_div
                }
                //tone not left playing at end??
            }
        } else if (style = Stacatto) {
            //NOTE: we don't support a slur into a staccato note
            d = l / staccato_divisor
            l -= d
            synthesiser.tone_for(frequency, l)
        }
    }
}
