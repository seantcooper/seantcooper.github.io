function callStack() {
    return new Error().stack;

}

function trace() {
    console.log.apply(null, arguments);
}
