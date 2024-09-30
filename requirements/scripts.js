document.addEventListener("DOMContentLoaded", () => { 
    const productContainer = document.getElementById('product-container');
    fetch('./requirements/pullDisplays.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            access_token: access_token 
        })
    })
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok.');
        return response.json();
    })
    .then(data => {
            if (!data.error) {
                var qrCodeCount = 0;
                data.items.forEach(item => {
                    //filtering out items that shouldn't be included
                    if ((!item.description.includes('Display Wall')) 
                    && (!item.description.includes('Refillable Water'))
                    && (!item.description.includes('Liner'))
                    && (!item.description.includes('Sample'))) {
                        qrCodeCount++;
                        const newQRCodeID = "qrCode" + String(qrCodeCount);
                        console.log(newQRCodeID);
                        const productCard = document.createElement('div');
                        productCard.className = 'product-card';
                        let productBrand = toProperCase(item.brand).replace(/ /g, '-');
                        productCard.classList.add(productBrand);
                        //will re-show products after sortByBrand is done
                        productCard.style.display = 'none';
                        appendToList(item.brand);
                        const imageURL = `https://inventory.zoho.com/DocTemplates_ItemImage_${item.img_document_id}.zbfs?organization_id=697533414`;
                        var url = item.gnp_url;
                        let regularPrice = '';
                        //fixing missing discount
                        if (item.sale_price == item.regular_price) {
                            regularPrice = (parseInt(item.regular_price)/0.9).toFixed(2);
                        }
                        else {
                            regularPrice = item.regular_price;
                        }
                        const salePrice = parseFloat(item.sale_price).toFixed(2);
                        productCard.innerHTML = `
                            <input type="checkbox" class="select-product" />
                            <img src="${imageURL}" alt="${item.name}" class="product-image">
                            <div class="product-details">
                                <div class="product-name">${item.description}</div>
                                <div class="product-description">${item.name}</div>
                                <div class="product-price-text">Price: <span class="product-sale-price">$${salePrice}</span> <span class="product-regular-price">$${regularPrice}</span></div>
                                <div class="product-manufacturer">Manufactured by ${item.manufacturer}</div><canvas id="${newQRCodeID}" class="hiddenWhileNotPrinting"></canvas>
                            </div>
                            
                        `;

                        productContainer.appendChild(productCard);
            
                        if (url !== null) {
                            setTimeout(generateQRCodes(newQRCodeID, url),1000);
                        }
                    }
                });
            } else {
                console.error('Error fetching products:', data.message);
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
        });
        setTimeout(sortByBrand,3500);
});

function sortByBrand() {
    const productCards = document.querySelectorAll('.product-card');
    if (productCards.length === 0) {
        console.log("No product cards found.");
        return; 
    }
    const productsArray = Array.from(productCards);
    productsArray.sort((a, b) => {
        const classA = Array.from(a.classList).filter(className => className !== 'product-card')[0] || '';
        const classB = Array.from(b.classList).filter(className => className !== 'product-card')[0] || '';
        return classA.localeCompare(classB);
    });
    const container = productCards[0].parentNode; 
    productsArray.forEach(productCard => {
        container.appendChild(productCard);
        productCard.style.display = '';
    });
    document.getElementById('hideAfterLoaded').remove();
}



function generateQRCodes(id, url) {
    let qr = document.getElementById(id)
    QRCode.toCanvas(qr, url, function (error) {
      if (error) console.error(error)
    })
}


let printMode = 'selected'; 
function showPrintOptionsModal(mode) {
    printMode = mode;
    document.getElementById('printOptionsModal').style.display = 'block';
}

function printProducts(productsPerPage) {
    const className = productsPerPage === 4 ? 'four-per-page' : 'two-per-page';

    window.onbeforeprint = () => {
        storeOriginalStyles();
        document.getElementById('printOptionsModal').style.display = 'none';
        document.getElementById('printOptionsModal').style.zIndex = '-1';
        document.querySelectorAll('.product-card').forEach(card => {
            if (printMode === 'all' || card.querySelector('input[type="checkbox"]').checked) {
                card.classList.add('printable', className);
            } else {
                card.classList.add('noprint');
            }
        });
        if (productsPerPage == 4) {
            //case 4 per page
            document.querySelectorAll('.hiddenWhileNotPrinting').forEach(qrCode => {
                qrCode.style.display = 'inline-block';
                qrCode.style.top = '';
                qrCode.style.bottom = '';
                qrCode.style.position = 'relative';
                qrCode.style.paddingTop = "8px";
                qrCode.style.paddingLeft = "1.48rem";
            })
            document.querySelectorAll('.printable').forEach(div => {
                div.style.paddingTop = "6px";
            })
        }
        else if (productsPerPage == 2) {
            //case 2 per page
            document.querySelectorAll('.printable').forEach(div => {
                div.style.paddingTop = "5.5rem";
            })
        }
    };

    window.print();

        document.getElementById('printOptionsModal').style.display = 'block';
        document.getElementById('printOptionsModal').style.zIndex = '10000000';
        document.querySelectorAll('.product-card').forEach(card => {
            card.classList.remove('noprint', 'printable', 'four-per-page', 'two-per-page');
        });
        document.querySelectorAll('.product-card').forEach(div => {
            div.style.paddingTop = '';
        })
        closeModal();
    
      revertStyles();
}

//storing original styles to revert qr codes to normal css. (it is being changed in printProducts depending on if they pick 2 / 4 per page
let originalStyles = new Map();
function storeOriginalStyles() {
    document.querySelectorAll('.hiddenWhileNotPrinting').forEach(element => {
        originalStyles.set(element, {
            display: element.style.display,
            position: element.style.position,
            bottom: element.style.bottom,
            right: element.style.right,
            height: element.style.height,
            width: element.style.width
        });
    });
}

//reverting styles of qr codes
function revertStyles() {
    document.querySelectorAll('.hiddenWhileNotPrinting').forEach(element => {
        if (originalStyles.has(element)) {
            const styles = originalStyles.get(element);
            element.style.display = styles.display;
            element.style.position = styles.position;
            element.style.bottom = styles.bottom;
            element.style.right = styles.right;
            element.style.height = styles.height;
            element.style.width = styles.width;
        }
    });
    originalStyles.clear();
}




function printSelectedProducts() {
    const selectedProducts = document.querySelectorAll('.product-card input[type="checkbox"]:checked');
    if (selectedProducts.length === 0) {
        alert("No products selected for printing.");
        return;
    }
    showPrintOptionsModal('selected');
}

function printEverything() {
    showPrintOptionsModal('all');
}

function toProperCase(str) {
    return str.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

$(function () {
    var $select = $("#brandDropdown").selectize({
        plugins: ['remove_button'], 
        sortField: 'text',
        maxItems: null, 
        persist: true,  
        delimiter: ',',
        closeAfterSelect: false,
        onChange: filterProductsByBrand //calling filter functions
    });

    window.appendToList = function(brand) {
        var selectize = $("#brandDropdown")[0].selectize;
        var properCaseBrand = toProperCase(brand).replace(/ /g, '-');

        if (properCaseBrand === 'All-Brands') { 
            return;
        }

        if (!selectize.options[properCaseBrand]) {
            selectize.addOption({value: properCaseBrand, text: properCaseBrand.replace(/-/g, ' ')});
            selectize.refreshOptions();
        }
    };
});

function filterProductsByBrand() {
    const selectize = $("#brandDropdown")[0].selectize;
    $('#brandDropdown')[0].selectize.removeOption(1)
    const selectedBrands = selectize.items;  
    document.querySelectorAll('.product-card').forEach(card => {
        const cardBrand = card.classList.value.split(' ').find(cls => selectedBrands.includes(cls.replace(' ', '-')));
        if (cardBrand || selectedBrands.length === 0) {
            card.style.display = '';  
        } else {
            card.style.display = 'none';  
        }
    });
}


function clearSelectedProducts() {
    const selectedProducts = document.querySelectorAll('.product-card input[type="checkbox"]:checked');
    selectedProducts.forEach((checkbox) => {
        checkbox.checked = false;
      });
}



function closeModal() {
    document.getElementById('printOptionsModal').style.display = 'none';
  
}

function setupModalCloseEvent() {
    window.onclick = function(event) {
        const modal = document.getElementById('printOptionsModal');
        if (event.target === modal) {
            closeModal();
        }
    };
}

window.onload = setupModalCloseEvent;

//going back to index to refresh data
document.getElementById('refresh').addEventListener('click', function() {
    var currentUrl = window.location.href;
    var baseUrl = currentUrl.substring(0, currentUrl.lastIndexOf("/"));
    window.location.href = baseUrl;
})
