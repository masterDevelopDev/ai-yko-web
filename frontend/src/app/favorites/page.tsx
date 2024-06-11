'use client'

import Publication from '@/components/Search/Publication'
import useFavorites from '@/hooks/useFavorites'

export default function Favorites() {
  const { favoriteDocuments, isLoadingFavoriteDocuments } = useFavorites()

  return (
    <div className="bg-white px-3 pb-40 md:px-10">
      <h1 className="sticky top-0 z-50 bg-white pb-5 pt-20 text-2xl font-bold md:pb-20 md:pt-10">
        Favorite documents
      </h1>

      <div className="flex w-full flex-col items-center justify-center gap-2 pt-5">
        {isLoadingFavoriteDocuments ? (
          <p>Loading...</p>
        ) : (
          <>
            {favoriteDocuments.length === 0 ? (
              <p>No favorite documents</p>
            ) : (
              favoriteDocuments.map((fav) => (
                <Publication document={fav} key={fav.id} />
              ))
            )}
          </>
        )}
      </div>
    </div>
  )
}
