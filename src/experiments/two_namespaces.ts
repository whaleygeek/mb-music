
//% weight=100 color=#ff0000 icon="*"
namespace One {
    let myvar = 1

    /**
     * Does a tryme
     * @param b sets a value, eg:120
     */

    //% blockId=one_tryme block="tryme %value" blockGap=8

    export function try_me(b: number): void {
        myvar = b
    }
}

//% weight=100 color=#0000ff icon="*"
namespace Two {
    let myvar = 2

    /**
     * Does a tryme
     * @param b sets a value, eg:120
     */

    //% blockId=two_tryme block="tryme %value" blockGap=8

    export function try_me(b: number): void {
        myvar =  b
    }
}

