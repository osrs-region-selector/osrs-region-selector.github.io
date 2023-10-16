const categories = document.querySelectorAll('input[type="checkbox"]');
const items = document.getElementById('items');
let itemData = null;

// Loads item data
fetch('item-data.json')
    .then(response => response.json())
    .then(data => {
        itemData = data;
        updateItemList();
    });

categories.forEach(category => {
    category.addEventListener('change', () => {
        if (category.id !== 'cat0' && category.id !== 'cat1') {
            const selectedCheckboxes = document.querySelectorAll('input[type="checkbox"]:checked');
            const selectedCount = selectedCheckboxes.length - 2; // Subtract the default checkboxes

            // Disable the remaining checkboxes if the user selects 3
            if (selectedCount >= 3) {
                categories.forEach(checkbox => {
                    if (checkbox.id !== 'cat0' && checkbox.id !== 'cat1' && !checkbox.checked) {
                        checkbox.disabled = true;
                    }
                });
            } else {
                categories.forEach(checkbox => {
                    if (checkbox.id !== 'cat0' && checkbox.id !== 'cat1') {
                        checkbox.disabled = false;
                    }
                });
            }

            // Uncheck the last selected checkbox if the user exceeds the limit
            if (selectedCount > 3) {
                const lastSelected = selectedCheckboxes[selectedCheckboxes.length - 1];
                lastSelected.checked = false;
            }
        }
        updateItemList();
    });
});

function updateItemList() {
    if (!itemData) {
        return;
    }

    // Clear existing region boxes
    const regionContainer = document.getElementById('items');
    regionContainer.innerHTML = '';

    // Group items by regions
    const selectedCategories = [];
    categories.forEach(category => {
        if (category.checked) {
            selectedCategories.push(category.id);
        }
    });

    const displayedItems = new Set();

    const regions = {};

    itemData.items.concat(itemData.bosses).forEach(item => {
        if (item.regions.every(region => selectedCategories.includes(`cat${region}`))) {
            item.regions.sort();
            const regionKey = item.regions.join(',');

            if (!regions[regionKey]) {
                regions[regionKey] = { items: [], bosses: [] };
            }

            if (!displayedItems.has(item.name)) {
                if (item.type === 'item') {
                    regions[regionKey].items.push(item);
                } else if (item.type === 'boss') {
                    regions[regionKey].bosses.push(item);
                }

                displayedItems.add(item.name);
            }
        }
    });

    for (const region in regions) {
        const regionBox = document.createElement('div');
        regionBox.className = 'region-box';

        const regionTitle = document.createElement('div');
        regionTitle.className = 'region-title';
        const regionIds = region.split(',').map(Number);
        if (regionIds.length > 1) {
            const regionNames = regionIds.map(getRegionName);
            regionTitle.innerText = regionNames.join(' & ');
        } else {
            regionTitle.innerText = getRegionName(regionIds[0]);
        }
        regionBox.appendChild(regionTitle);

        if (regions[region].items.length > 0) {
            const itemHeader = document.createElement('div');
            itemHeader.className = 'header';
            itemHeader.innerText = 'Items:';
            regionBox.appendChild(itemHeader);

            const itemContainer = document.createElement('ul');
            itemContainer.className = 'region-items';

            regions[region].items.forEach(item => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `<div class="list-item">
                    <img loading="lazy" crossorigin="anonymous" src="${item.imgUrl}" alt="${item.name}">
                </div>
                <span>${item.name}</span>`;
                itemContainer.appendChild(listItem);
            });

            regionBox.appendChild(itemContainer);
        }

        if (regions[region].bosses.length > 0) {
            const bossHeader = document.createElement('div');
            bossHeader.className = 'header';
            bossHeader.innerText = 'Bosses:';
            regionBox.appendChild(bossHeader);

            const bossContainer = document.createElement('ul');
            bossContainer.className = 'region-items';

            regions[region].bosses.forEach(item => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `<div class="list-item">
                    <img loading="lazy" crossorigin="anonymous" src="${item.imgUrl}" alt="${item.name}">
                </div>
                <span>${item.name}</span>`;
                bossContainer.appendChild(listItem);
            });

            regionBox.appendChild(bossContainer);
        }

        regionContainer.appendChild(regionBox);
    }
}


function getRegionName(regionId) {
    const regionNames = {
        0: 'Misthalin',
        1: 'Karamja',
        2: 'Asgarnia',
        3: 'Desert',
        4: 'Fremennik',
        5: 'Kandarin',
        6: 'Morytania',
        7: 'Tirannwyn',
        8: 'Wilderness',
        9: 'Kourend'
    };

    return regionNames[regionId] || `Region ${regionId}`;
}
