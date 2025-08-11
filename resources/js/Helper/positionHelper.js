export function calculateNewPosition(itemAbove, itemBelow) {
    //Can be any number that is not to low that will trigger the reindexing and
    //not to high so you won't waste too much available space
    const offset = 17;

    if(!itemAbove && !itemBelow ){
        return 1000;
    }

    if (!itemAbove) {
        return itemBelow.position_number - offset;
    }

    if (!itemBelow) {
        return itemAbove.position_number + offset;
    }

    if (itemBelow && itemAbove) {
        return (itemAbove.position_number + itemBelow.position_number) / 2;
    }

    return 1000;
}

export function checkIfReposition(items) {
    return items.some((list, index, array) => {
        if (index === 0) return false;

        const prevList = array[index - 1];

        return Math.abs(list.position_number - prevList.position_number) < 10;
    });
}

