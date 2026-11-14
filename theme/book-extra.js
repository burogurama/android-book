// Shows where the current chapter sits in the stack of layers.
//
// The sidebar lists the parts of the book in a fixed order. Parts II to IX
// are the eight layers, from the hardware up to the apps. Part I is the map
// of the whole stack, and Part X (security) crosses all layers.
// Keep PARTS in the same order as the parts in src/SUMMARY.md.
(function () {
    const PARTS = ['map', 'boot', 'kernel', 'native', 'binder', 'system', 'art', 'framework', 'apps', 'security'];
    const LAYERS = PARTS.slice(1, 9);

    function partOfActiveChapter() {
        const active = document.querySelector('.sidebar-scrollbox a.active');
        if (!active) {
            return null;
        }
        const titles = Array.from(document.querySelectorAll('.sidebar-scrollbox li.part-title'));
        let current = null;
        for (const title of titles) {
            const isBefore = title.compareDocumentPosition(active) & Node.DOCUMENT_POSITION_FOLLOWING;
            if (!isBefore) {
                break;
            }
            current = title;
        }
        if (!current) {
            return null;
        }
        return { key: PARTS[titles.indexOf(current)], title: current.textContent.trim() };
    }

    function addGauge() {
        const heading = document.querySelector('#mdbook-content main h1');
        const part = partOfActiveChapter();
        if (!heading || !part || !part.key) {
            return;
        }

        const gauge = document.createElement('div');
        gauge.className = 'stack-gauge';
        gauge.dataset.part = part.key;

        const bars = document.createElement('span');
        bars.className = 'bars';
        bars.setAttribute('aria-hidden', 'true');
        // The top bar is the top layer, so the list is drawn in reverse.
        for (const layer of LAYERS.slice().reverse()) {
            const bar = document.createElement('i');
            bar.dataset.layer = layer;
            if (part.key === layer || part.key === 'map') {
                bar.className = 'on';
            }
            bars.appendChild(bar);
        }

        const label = document.createElement('span');
        label.textContent = part.title;

        gauge.append(bars, label);
        heading.before(gauge);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addGauge);
    } else {
        addGauge();
    }
})();
