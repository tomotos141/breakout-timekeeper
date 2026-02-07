const { JSDOM } = require('jsdom');
const path = require('path');

(async () => {
    const filePath = path.resolve(__dirname, '..', 'index.html');
    console.log('Loading', filePath);
    const dom = await JSDOM.fromFile(filePath, { runScripts: 'dangerously', resources: 'usable' });

    await new Promise(resolve => {
        dom.window.addEventListener('load', () => setTimeout(resolve, 200));
    });

    const w = dom.window;

    const expect = (cond, msg) => {
        if (!cond) {
            console.error('FAILED:', msg);
            process.exitCode = 2;
        } else {
            console.log('OK:', msg);
        }
    };

    // Basic function existence
    ['startTimer','pauseTimer','nextSection','useSavedTime','toggleMeetingType','openPiP','updatePiPControls','resetTimer'].forEach(fn => {
        expect(typeof w[fn] === 'function', `function ${fn} exists`);
    });

    // Ensure no sync globals remain
    expect(typeof w.roomRef === 'undefined' || w.roomRef === null, 'roomRef removed or null');
    expect(typeof w.joinRoom === 'undefined', 'joinRoom removed');
    expect(typeof w.createOffer === 'undefined', 'createOffer removed');

    // Test reset -> set savedTime and useSavedTime
    w.resetTimer();
    // stub audio in jsdom
    w.AudioContext = function() { 
        this.createOscillator = () => ({
            connect: () => {},
            start: () => {},
            stop: () => {},
            frequency: { value: 440 },
            type: 'sine'
        });
        this.createGain = () => ({
            connect: () => {},
            gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} }
        });
    };
    w.webkitAudioContext = w.AudioContext;
    w.eval('savedTime = 90; timeRemaining = 10;');
    w.useSavedTime(30);
    const savedAfter = w.eval('savedTime');
    const timeAfter = w.eval('timeRemaining');
    console.log('after useSavedTime -> savedTime:', savedAfter, 'timeRemaining:', timeAfter);
    expect(savedAfter === 60, 'savedTime decreased by 30');
    expect(timeAfter === 40, 'timeRemaining increased by 30');

    // Toggle meeting type
    const before = w.eval('meetingType');
    w.eval('toggleMeetingType()');
    const after = w.eval('meetingType');
    console.log('before/toggle/after meetingType:', before, after);
    expect(after !== before, 'meetingType toggled');

    // Advance section
    w.currentIndex = 0;
    const prevIndex = w.currentIndex;
    w.nextSection();
    expect(w.currentIndex === prevIndex + 1 || w.currentIndex === 0 /*if ended and reset*/, 'nextSection advances index or completes');

    // PiP open - should not throw
    try {
        const maybe = await w.openPiP();
        console.log('openPiP returned:', typeof maybe);
        console.log('OK: openPiP did not throw');
    } catch (e) {
        console.error('FAILED: openPiP threw', e);
        process.exitCode = 3;
    }

    console.log('Smoke test finished. process.exitCode =', process.exitCode || 0);
})();