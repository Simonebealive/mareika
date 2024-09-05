import { sendData, compareToken } from "./token.js"

let user = JSON.parse(sessionStorage.user || null)
let loader = document.querySelector('.loader')


// check if user is logged in
window.onload = () => {
    if (!user) {
        location.replace('/login')
    }
    else if (!compareToken(user.authToken, user.email)) {
        location.replace('/login')
    }
}

// price inputs
const addBtn = document.querySelector('#add-btn')
const actualPrice = document.querySelector('#actual-price')
const discountPercentage = document.querySelector('#discount-percentage')
const sellPrice = document.querySelector('#sell-price')

discountPercentage.addEventListener('input', () => {
    if (!discountPercentage.value) {
        sellPrice.value = ''
        return
    }
    if (discountPercentage.value > 99) {
        sellPrice.value = 0
    } else {
        let discount = actualPrice.value * discountPercentage.value / 100
        sellPrice.value = actualPrice.value - discount
    }
})

sellPrice.addEventListener('input', () => {
    if (!sellPrice.value) {
        discountPercentage.value = ''
        return
    }
    let actualPriceValue = parseFloat(actualPrice.value) || 0
    let sellPriceValue = parseFloat(sellPrice.value) || 0
    if (sellPriceValue > actualPriceValue) {
        discountPercentage.value = 0
    } else {
        let discount = sellPriceValue / actualPriceValue * 100
        discountPercentage.value = discount
    }
})

actualPrice.addEventListener('input', () => {
    if (!actualPrice.value) {
        discountPercentage.value = ''
        return
    }
    let actualPriceValue = parseFloat(actualPrice.value) || 0
    let sellPriceValue = parseFloat(sellPrice.value) || 0
    if (actualPriceValue < sellPriceValue) {
        discountPercentage.value = 0
    } else {
        let discount = sellPriceValue / actualPriceValue * 100
        discountPercentage.value = discount
    }
})

// handle upload image
let uploadImages = document.querySelectorAll('.fileupload')
let imagePaths = []

uploadImages.forEach((fileupload, index) => {
    fileupload.addEventListener('change', () => {
        const file = fileupload.files[0]
        let imageUrl
        if (file.type.includes('image')) {
            fetch('/s3url').then(res => res.json())
                .then(url => {
                    fetch(url, {
                        method: 'PUT',
                        headers: new Headers({ 'Content-Type': 'multipart/form-data' }),
                        body: file
                    }).then(res => {
                        imageUrl = url.split("?")[0]
                        imagePaths[index] = imageUrl
                        let label = document.querySelector(`label[for=${fileupload.id}]`)
                        label.style.backgroundImage = `url(${imageUrl})`
                    })
                })
        }
    })
})
