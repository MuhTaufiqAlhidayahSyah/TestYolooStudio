        let slideIndex = 1;
        let slideTimer;

        // Jalankan slideshow otomatis saat halaman dimuat
        window.onload = function() {
            showSlides(slideIndex);
            autoSlides();
        }

        // Next/previous controls
        function plusSlides(n) {
            clearTimeout(slideTimer);
            showSlides(slideIndex += n);
            autoSlides();
        }

        // Thumbnail image controls
        function currentSlide(n) {
            clearTimeout(slideTimer);
            showSlides(slideIndex = n);
            autoSlides();
        }

        function showSlides(n) {
            let i;
            let slides = document.getElementsByClassName("mySlides");
            let dots = document.getElementsByClassName("dot");
            
            if (n > slides.length) {slideIndex = 1}
            if (n < 1) {slideIndex = slides.length}
            
            // Sembunyikan semua slides
            for (i = 0; i < slides.length; i++) {
                slides[i].style.display = "none";
            }
            
            // Nonaktifkan semua dots
            for (i = 0; i < dots.length; i++) {
                dots[i].className = dots[i].className.replace(" active", "");
            }
            
            // Tampilkan slide aktif dan aktifkan dot
            slides[slideIndex-1].style.display = "block";
            dots[slideIndex-1].className += " active";
        }

        // Auto slideshow setiap 5 detik
        function autoSlides() {
            slideTimer = setTimeout(function() {
                slideIndex++;
                showSlides(slideIndex);
                autoSlides();
            }, 5000);
        }