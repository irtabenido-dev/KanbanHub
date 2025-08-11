export function calculateNewPosition(itemAbove, itemBelow){

    if(itemAbove === null){
        return Math.max(itemBelow.position_number - 1);
    }

    if(itemBelow === null){
        return itemAbove.position_number + 1000;
    }

    return (itemAbove.position_number + itemBelow.position_number) / 2;
}

export function checkIfReposition(items){
    return items.some((list, index, array) => {
        if(index === 0) return false;

        const prevList = array[index - 1];

        return Math.abs(list.position_number - prevList.position_number) < 1000;
    });
}

export function reIndexPositions(items){
    let gap = 1000;

    return items.map((item)=> ({
        ...item,
        position_number: gap+=1000
    }));
}
